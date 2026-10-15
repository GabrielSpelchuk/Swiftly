import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { User } from '../../users/entities/user.entity';
import { ORDER_SOURCE } from '../../utils/orderSource';
import { ORDER_STATUS } from '../../utils/orderStatus';

@Entity({ name: 'orders' })
@Index(['placedById'])
@Index(['supplierId'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ORDER_STATUS, default: ORDER_STATUS.NEW })
  status!: ORDER_STATUS;

  @Column({ type: 'enum', enum: ORDER_SOURCE })
  source!: ORDER_SOURCE;

  @Column({ name: 'customer_name' })
  customerName!: string;

  @Column({ name: 'customer_phone' })
  customerPhone!: string;

  @Column({ name: 'customer_address', type: 'text' })
  customerAddress!: string;

  @Column({ name: 'tracking_number', type: 'varchar', nullable: true })
  trackingNumber!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'total_wholesale', type: 'decimal', precision: 12, scale: 2 })
  totalWholesale!: number;

  @Column({ name: 'total_retail', type: 'decimal', precision: 12, scale: 2 })
  totalRetail!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  profit!: number;

  @Column({ name: 'placed_by', type: 'uuid' })
  placedById!: string;

  @ManyToOne(() => User, (user) => user.placedOrders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placed_by' })
  placedBy!: User;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId!: string;

  @ManyToOne(() => User, (user) => user.supplierOrders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items!: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
