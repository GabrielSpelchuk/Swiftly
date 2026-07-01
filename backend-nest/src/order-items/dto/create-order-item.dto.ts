import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

@Exclude()
export class CreateOrderItemDto {
  @Expose()
  @IsUUID('4')
  productId!: string;

  @Expose()
  @IsInt()
  @Min(1)
  quantity!: number;
}
