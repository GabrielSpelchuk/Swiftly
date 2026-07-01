import { IsUUID } from 'class-validator';
import { CartItem } from './cart-item.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'carts' })
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @IsUUID('4')
  userId!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items!: CartItem[];

  @Column({ name: 'created_at' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
