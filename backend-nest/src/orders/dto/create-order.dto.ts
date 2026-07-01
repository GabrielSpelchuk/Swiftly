import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from 'src/order-items/dto/create-order-item.dto';
import { ORDER_SOURCE } from 'src/utils/orderSource';

@Exclude()
export class CreateOrderDto {
  @Expose()
  @IsEnum(ORDER_SOURCE)
  source!: ORDER_SOURCE;

  @Expose()
  @IsString()
  customerName!: string;

  @Expose()
  @IsString()
  customerPhone!: string;

  @Expose()
  @IsString()
  customerAddress!: string;

  @Expose()
  @IsString()
  trackingNumber?: string;

  @Expose()
  @IsString()
  notes?: string;

  @Expose()
  @IsUUID('4')
  placedById!: string;

  @Expose()
  @IsUUID('4')
  supplierId!: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
