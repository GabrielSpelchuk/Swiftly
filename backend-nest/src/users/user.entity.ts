import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Roles } from 'src/utils/roles';

@Entity()
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

  @Column({ nullable: true })
  activationToken!: string | null;

  @Column({ nullable: true })
  resetToken!: string | null;

  @Column({ default: false })
  isBlocked!: boolean;

  @Column({ nullable: true })
  phone!: string | null;

  @Column({ type: 'float', default: 0 })
  balance!: number;

  @Column({ nullable: true })
  shopUrl!: string | null;

  @Column({ nullable: true })
  salesChannel!: string | null;

  @Column({ nullable: true })
  experience!: string | null;

  @Column({ default: true })
  isApproved!: boolean;
}
