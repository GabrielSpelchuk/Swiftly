import { IsDecimal, IsInt, IsUUID, Min } from 'class-validator';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsInt()
  @Min(1)
  quantity!: number;

  @Column({ name: 'price_at_order', type: 'decimal', scale: 2 })
  @IsDecimal()
  priceAtOrder!: number;

  @Column({ name: 'wholesale_price_at_order', type: 'decimal', scale: 2 })
  @IsDecimal()
  wholesalePriceAtOrder!: number;

  @Column({ name: 'created_at' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ name: 'order_id' })
  @IsUUID('4')
  @ManyToOne(() => Order, (order) => order.items as string)
  @JoinColumn({ name: 'order_id' })
  orderId!: string;

  @Column({ name: 'product_id' })
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: string;
}
