import { IsInt, IsUUID, Min } from 'class-validator';
import { Cart } from './cart.entity';
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

@Entity({ name: 'cart_items' })
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', nullable: false, default: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @Column({ name: 'cart_id', type: 'uuid' })
  @IsUUID('4')
  cartId!: string;

  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;

  @Column({ name: 'product_id', type: 'uuid' })
  @IsUUID('4')
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'created_at' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
