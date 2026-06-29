import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'categories' })
export class Category {
  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  @Length(3, 25)
  name!: string;

  @PrimaryColumn({ unique: true })
  @IsNotEmpty()
  @IsString()
  @Length(3, 25)
  slug!: string;

  @Column({ nullable: true })
  @IsString()
  @MaxLength(255)
  description!: string;

  @Column({ name: 'created_at' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
