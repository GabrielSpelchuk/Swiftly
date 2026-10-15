import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ORDER_SOURCE } from '../../utils/orderSource';

export class CreateOrderItemDto {
  @IsUUID('4')
  productId!: string;

  @Type(() => Number)
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsEnum(ORDER_SOURCE)
  source!: ORDER_SOURCE;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerName!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(30)
  customerPhone!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  customerAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsUUID('4')
  placedById!: string;

  @IsUUID('4')
  supplierId!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Order must contain at least one item' })
  @ArrayMaxSize(100, { message: 'Too many items in one order' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
