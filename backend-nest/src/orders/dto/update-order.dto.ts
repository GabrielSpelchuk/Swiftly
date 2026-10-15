import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ORDER_STATUS } from '../../utils/orderStatus';

export class UpdateOrderDto {
  @IsEnum(ORDER_STATUS)
  status!: ORDER_STATUS;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;
}
