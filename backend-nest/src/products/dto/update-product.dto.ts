import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Exclude, Expose } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsString, Min } from 'class-validator';

@Exclude()
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @Expose()
  @IsString()
  name?: string;

  @Expose()
  @IsString()
  description?: string;

  @Expose()
  @IsNumber()
  @Min(0)
  wholesalePrice?: number;

  @Expose()
  @IsNumber()
  @Min(0)
  retailPrice?: number;

  @Expose()
  @IsInt()
  @Min(0)
  stock?: number;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
