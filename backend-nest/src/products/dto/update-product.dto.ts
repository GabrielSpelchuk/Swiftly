import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @Expose()
  name?: string;

  @Expose()
  description?: string;

  @Expose()
  wholesalePrice?: number;

  @Expose()
  retailPrice?: number;

  @Expose()
  stock?: number;

  @Expose()
  images?: string[];
}
