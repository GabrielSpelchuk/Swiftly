import {
  IsDecimal,
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { User } from 'src/users/entities/user.entity';
import { ORDER_SOURCE } from 'src/utils/orderSource';
import { ORDER_STATUS } from 'src/utils/orderStatus';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ORDER_STATUS, default: ORDER_STATUS.NEW })
  @IsEnum(ORDER_STATUS)
  status!: ORDER_STATUS;

  @Column({ type: 'enum', enum: ORDER_SOURCE })
  @IsEnum(ORDER_SOURCE)
  source!: ORDER_SOURCE;

  @Column({ name: 'customer_name' })
  @IsString()
  customerName!: string;

  @Column({ name: 'customer_phone' })
  @IsString()
  customerPhone!: string;

  @Column({ name: 'customer_address' })
  @IsString()
  customerAddress!: string;

  @Column({ name: 'tracking_number', nullable: true })
  @IsString()
  trackingNumber!: string;

  @Column({ name: 'total_wholesale', type: 'decimal', scale: 2 })
  @IsDecimal()
  totalWholesale!: number;

  @Column({ name: 'total_retail', type: 'decimal', scale: 2 })
  @IsDecimal()
  totalRetail!: number;

  @Column({ type: 'decimal', scale: 2, default: 0 })
  @IsDecimal()
  profit!: number;

  @Column()
  @IsString()
  @MaxLength(255)
  notes!: string;

  @Column({ name: 'created_at' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ name: 'placed_by' })
  @IsUUID('4')
  @ManyToOne(() => User)
  @JoinColumn({ name: 'placed_by' })
  palcedBy!: string;

  @Column({ name: 'supplier_id' })
  @IsUUID('4')
  @ManyToOne(() => User)
  @JoinColumn({ name: 'supplier_id' })
  supplierId!: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.orderId)
  items;
}
