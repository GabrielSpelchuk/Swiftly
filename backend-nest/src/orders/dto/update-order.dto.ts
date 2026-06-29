import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { Exclude, Expose } from 'class-transformer';
import { ORDER_STATUS } from 'src/utils/orderStatus';

@Exclude()
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @Expose()
  status?: ORDER_STATUS | undefined;

  @Expose()
  trackingNumber?: string | undefined;
}
