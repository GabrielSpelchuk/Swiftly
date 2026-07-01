import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { Exclude, Expose } from 'class-transformer';
import { ORDER_STATUS } from 'src/utils/orderStatus';
import { IsEnum, IsString } from 'class-validator';

@Exclude()
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @Expose()
  @IsEnum(ORDER_STATUS)
  status!: ORDER_STATUS;

  @Expose()
  @IsString()
  trackingNumber?: string | undefined;
}
