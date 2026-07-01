import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { Order } from './entities/order.entity';
import { ORDER_SOURCE } from 'src/utils/orderSource';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/utils/roles';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    private ordersRepository: Repository<Order>,
    private readonly usersService: Repository<User>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { placedById, supplierId, source, items, notes, ...customerInfo } =
      createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const productIds = items.map((i) => i.productId);
      const products = await manager.find(Product, {
        where: { id: In(productIds) },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalWholesale = 0;
      let totalRetail = 0;
      const orderItemsToSave: Partial<OrderItem>[] = [];

      for (const item of items) {
        const product = productMap.get(item.productId);

        if (!product || !product.isActive) {
          throw new BadRequestException(
            `Product ${item.productId} not found or inactive`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}"`,
          );
        }

        product.stock -= item.quantity;
        await manager.save(Product, product);

        totalWholesale += +product.wholesalePrice * item.quantity;
        totalRetail = +product.retailPrice * item.quantity;

        orderItemsToSave.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: product.retailPrice,
          wholesalePriceAtOrder: product.wholesalePrice,
        });
      }

      const profit = totalWholesale - totalRetail;

      const order = manager.create(Order, {
        placedById,
        supplierId,
        source,
        ...customerInfo,
        totalRetail,
        totalWholesale,
        profit,
        notes,
      });

      const savedOrder = await manager.save(Order, order);

      if (source === ORDER_SOURCE.B2B && placedById) {
        await manager.increment(User, { id: placedById }, 'balance', profit);
      }

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOrderByUser(userId: string, role: Roles | string) {
    const where: FindOptionsWhere<Order> =
      role === Roles.dropshipper
        ? { supplierId: userId }
        : { placedById: userId };

    return await this.ordersRepository.find({
      where,
      relations: {
        placedBy: true,
        items: {
          product: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        placedBy: true,
        items: {
          product: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    orderId: string,
    supplierId: string,
    { status, trackingNumber }: UpdateOrderDto,
  ) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, supplierId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await this.ordersRepository.save(order);

    const placedBy = await this.usersService.findOne({
      where: { id: order.placedById },
    });
    if (placedBy) {
      //await sendOrderStatusEmail(placedBy.email, newStatus, trackingNumber);
    }

    return order;
  }
}
