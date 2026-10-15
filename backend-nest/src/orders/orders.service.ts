import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ORDER_SOURCE } from '../utils/orderSource';
import { ORDER_STATUS } from '../utils/orderStatus';
import { Roles } from '../utils/roles';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    placedById: string,
    supplierId: string,
  ): Promise<Order> {
    const { source, items, notes, trackingNumber, ...customerInfo } =
      createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const productIds = [...new Set(items.map((item) => item.productId))];

      const products = await manager.find(Product, {
        where: { id: In(productIds) },
      });

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

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

        totalWholesale += Number(product.wholesalePrice) * item.quantity;
        totalRetail += Number(product.retailPrice) * item.quantity;

        orderItemsToSave.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: Number(product.retailPrice),
          wholesalePriceAtOrder: Number(product.wholesalePrice),
        });
      }

      const wholesaleSum = Number(totalWholesale.toFixed(2));
      const retailSum = Number(totalRetail.toFixed(2));

      const profit = Number((retailSum - wholesaleSum).toFixed(2));

      const order = manager.create(Order, {
        ...customerInfo,
        placedById,
        supplierId,
        source,
        notes: notes?.trim() || null,
        trackingNumber: trackingNumber?.trim() || null,
        totalWholesale: wholesaleSum,
        totalRetail: retailSum,
        profit,
      });

      const savedOrder = await manager.save(Order, order);

      const itemsWithOrder = orderItemsToSave.map((item) => ({
        ...item,
        orderId: savedOrder.id,
      }));

      await manager.insert(OrderItem, itemsWithOrder);

      await this.decrementStock(manager, items);

      if (source === ORDER_SOURCE.B2B) {
        await manager.increment(
          User,
          { id: placedById, role: Roles.dropshipper },
          'balance',
          profit,
        );
      }

      await queryRunner.commitTransaction();

      return this.getOrderById(savedOrder.id, Roles.admin, placedById);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async decrementStock(
    manager: EntityManager,
    items: CreateOrderDto['items'],
  ): Promise<void> {
    for (const item of items) {
      const result = await manager
        .createQueryBuilder()
        .update(Product)
        .set({ stock: () => `stock - ${Number(item.quantity)}` })
        .where('id = :id', { id: item.productId })
        .andWhere('stock >= :quantity', { quantity: item.quantity })
        .execute();

      if (!result.affected) {
        throw new BadRequestException(
          `Not enough stock for product ${item.productId}`,
        );
      }
    }
  }

  async findByUser(userId: string, role: Roles): Promise<Order[]> {
    const where =
      role === Roles.dropshipper
        ? { supplierId: userId }
        : { placedById: userId };

    return this.ordersRepository.find({
      where,
      relations: { placedBy: true, items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: string, role: Roles, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { placedBy: true, supplier: true, items: { product: true } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isParticipant =
      order.placedById === userId || order.supplierId === userId;

    if (role !== Roles.admin && !isParticipant) {
      throw new ForbiddenException('You cannot view this order');
    }

    return order;
  }

  async updateStatus(
    orderId: string,
    supplierId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, supplierId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      order.status === ORDER_STATUS.DELIVERED &&
      updateOrderDto.status !== ORDER_STATUS.DELIVERED
    ) {
      throw new BadRequestException('Delivered order status cannot be changed');
    }

    order.status = updateOrderDto.status;

    if (updateOrderDto.trackingNumber !== undefined) {
      order.trackingNumber = updateOrderDto.trackingNumber || null;
    }

    return this.ordersRepository.save(order);
  }

  async remove(id: string, userId: string, role: Roles): Promise<string> {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isOwner = order.placedById === userId;
    const isSupplier = order.supplierId === userId;

    if (role !== Roles.admin && !isOwner && !isSupplier) {
      throw new ForbiddenException('You cannot delete this order');
    }

    if (order.status !== ORDER_STATUS.NEW) {
      throw new BadRequestException('Only new orders can be deleted');
    }

    const items = await this.dataSource
      .getRepository(OrderItem)
      .find({ where: { orderId: id } });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      for (const item of items) {
        await manager.increment(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );
      }

      await manager.remove(order);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return order.id;
  }
}
