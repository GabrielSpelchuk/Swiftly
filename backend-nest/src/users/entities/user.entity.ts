import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Roles } from '../../utils/roles';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { Cart } from '../../carts/entities/cart.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.customer })
  role!: Roles;

  @Column({ name: 'activation_token', type: 'varchar', nullable: true })
  activationToken!: string | null;

  @Column({ name: 'reset_token', type: 'varchar', nullable: true })
  resetToken!: string | null;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked!: boolean;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance!: number;

  @Column({ name: 'shop_url', type: 'varchar', nullable: true })
  shopUrl!: string | null;

  @Column({ name: 'sales_channel', type: 'varchar', nullable: true })
  salesChannel!: string | null;

  @Column({ type: 'text', nullable: true })
  experience!: string | null;

  @Column({ name: 'is_approved', type: 'boolean', default: true })
  isApproved!: boolean;

  @OneToMany(() => Product, (product) => product.supplier)
  products!: Product[];

  @OneToMany(() => Order, (order) => order.placedBy)
  placedOrders!: Order[];

  @OneToMany(() => Order, (order) => order.supplier)
  supplierOrders!: Order[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts!: Cart[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
