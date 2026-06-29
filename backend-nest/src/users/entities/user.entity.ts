import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Roles } from 'src/utils/roles';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.customer })
  role!: Roles;

  @Column({ name: 'activation_token', type: 'varchar', nullable: true })
  activationToken!: string | null;

  @Column({ name: 'reset_token', type: 'varchar', nullable: true })
  resetToken!: string | null;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked!: boolean;

  @Column({ nullable: true, type: 'varchar' })
  phone!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance!: number;

  @Column({ name: 'shop_url', type: 'varchar', nullable: true })
  shopUrl!: string | null;

  @Column({ name: 'sales_channel', type: 'varchar', nullable: true })
  salesChannel!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  experience!: string | null;

  @Column({ name: 'is_approved', type: 'boolean', default: true })
  isApproved!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
