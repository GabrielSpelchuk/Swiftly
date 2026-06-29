import { IsInt, Min } from 'class-validator';
import { Cart } from 'src/carts/entities/cart.entity';
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
  id;

  @Column({ type: 'int', nullable: false, default: 1 })
  @IsInt()
  @Min(1)
  quantity;

  @ManyToOne(() => Cart, (cart) => cart.items as string[])
  @JoinColumn({ name: 'cartId' })
  cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product;

  @Column({ name: 'created_at' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
