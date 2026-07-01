import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

@Exclude()
export class UpdateCartDto extends PartialType(CreateCartDto) {
  @Expose()
  @IsString()
  productId!: string;

  @Expose()
  @IsInt()
  @Min(1)
  quantity!: number;
}
