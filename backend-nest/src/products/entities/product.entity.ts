import {
  IsBoolean,
  IsDecimal,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  id!: string;

  @Column()
  @IsString()
  @Length(3, 50)
  name!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description!: string;

  @Column({ name: 'wholesale_price', type: 'decimal', precision: 10, scale: 2 })
  @IsDecimal()
  @IsPositive()
  wholesalePrice!: number;

  @Column({ name: 'retail_price', type: 'decimal', precision: 10, scale: 2 })
  @IsDecimal()
  @IsPositive()
  retailPrice!: number;

  @Column({ default: 0 })
  @IsInt()
  @Min(0)
  stock!: number;

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  @IsString({ each: true })
  images!: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @IsBoolean()
  isActive!: boolean;

  @Column({ name: 'supplier_id', type: 'uuid' })
  @IsUUID('4')
  supplierId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: User;

  @Column({ name: 'category_id', nullable: true })
  @IsOptional()
  @IsUUID('4')
  categoryId!: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ name: 'created_at' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
