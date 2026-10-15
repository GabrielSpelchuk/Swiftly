import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Roles } from '../utils/roles';

export interface StatusCount {
  status: string;
  count: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async forSupplier(supplierId: string) {
    const [totalOrders, revenue, activeProducts, totalProducts] =
      await Promise.all([
        this.ordersRepository.count({ where: { supplierId } }),
        this.sum('totalRetail', { supplierId }),
        this.productsRepository.count({
          where: { supplierId, isActive: true },
        }),
        this.productsRepository.count({ where: { supplierId } }),
      ]);

    const [ordersByStatus, topProducts] = await Promise.all([
      this.countByStatus('supplierId', supplierId),
      this.topProducts(supplierId),
    ]);

    return {
      totalOrders,
      revenue,
      ordersByStatus,
      topProducts,
      activeProducts,
      totalProducts,
    };
  }

  async forDropshipper(dropshipperId: string) {
    const [totalOrders, totalProfit, ordersByStatus, user] = await Promise.all([
      this.ordersRepository.count({ where: { placedById: dropshipperId } }),
      this.sum('profit', { placedById: dropshipperId }),
      this.countByStatus('placedById', dropshipperId),
      this.usersRepository.findOne({ where: { id: dropshipperId } }),
    ]);

    return {
      totalOrders,
      totalProfit,
      ordersByStatus,
      balance: Number(user?.balance ?? 0),
    };
  }

  async forAdmin() {
    const [totalUsers, totalProducts, totalOrders, revenue, profit, blocked] =
      await Promise.all([
        this.usersRepository.count(),
        this.productsRepository.count(),
        this.ordersRepository.count(),
        this.sum('totalRetail', {}),
        this.sum('profit', {}),
        this.usersRepository.count({ where: { isBlocked: true } }),
      ]);

    const ordersByStatus = await this.countByStatus('id', undefined, true);

    const usersByRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany<{ role: string; count: string }>();

    return {
      totalUsers,
      blockedUsers: blocked,
      totalProducts,
      totalOrders,
      revenue,
      profit,
      ordersByStatus,
      usersByRole: usersByRole.map((row) => ({
        role: row.role,
        count: Number(row.count),
      })),
    };
  }

  async forUser(userId: string, role: Roles) {
    switch (role) {
      case Roles.supplier:
        return this.forSupplier(userId);
      case Roles.dropshipper:
        return this.forDropshipper(userId);
      case Roles.admin:
        return this.forAdmin();
      default:
        return this.forCustomer(userId);
    }
  }

  private async forCustomer(customerId: string) {
    const [totalOrders, spent] = await Promise.all([
      this.ordersRepository.count({ where: { placedById: customerId } }),
      this.sum('totalRetail', { placedById: customerId }),
    ]);

    const ordersByStatus = await this.countByStatus('placedById', customerId);

    return { totalOrders, spent, ordersByStatus };
  }

  private async sum(
    field: 'totalRetail' | 'totalWholesale' | 'profit',
    where: Record<string, string>,
  ): Promise<number> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .select(`COALESCE(SUM(order.${field}), 0)`, 'value');

    for (const [key, value] of Object.entries(where)) {
      query.andWhere(`order.${key} = :${key}`, { [key]: value });
    }

    const result = await query.getRawOne<{ value: string }>();

    return Number(result?.value ?? 0);
  }

  private async countByStatus(
    column: 'supplierId' | 'placedById' | 'id',
    value?: string,
    all = false,
  ): Promise<StatusCount[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .orderBy('order.status', 'ASC');

    if (!all && value) {
      query.andWhere(`order.${column} = :value`, { value });
    }

    const rows = await query.getRawMany<{ status: string; count: string }>();

    return rows.map((row) => ({
      status: row.status,
      count: Number(row.count),
    }));
  }

  private async topProducts(supplierId: string): Promise<TopProduct[]> {
    const rows = await this.orderItemsRepository
      .createQueryBuilder('item')
      .innerJoin('item.product', 'product')
      .select('item.productId', 'productId')
      .addSelect('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .where('product.supplierId = :supplierId', { supplierId })
      .groupBy('item.productId')
      .addGroupBy('product.name')
      .orderBy('totalSold', 'DESC')
      .limit(5)
      .getRawMany<{ productId: string; name: string; totalSold: string }>();

    return rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      totalSold: Number(row.totalSold),
    }));
  }
}
