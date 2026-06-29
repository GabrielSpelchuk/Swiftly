import { Exclude, Expose } from 'class-transformer';
import { ORDER_SOURCE } from 'src/utils/orderSource';
import { ORDER_STATUS } from 'src/utils/orderStatus';

@Exclude()
export class CreateOrderDto {
  @Expose()
  status!: ORDER_STATUS;

  @Expose()
  source!: ORDER_SOURCE;

  @Expose()
  customerName!: string;

  @Expose()
  customerPhone!: string;

  @Expose()
  customerAddress!: string;

  @Expose()
  trackingNumber?: string;

  @Expose()
  totalWholesale!: number;

  @Expose()
  totalRetail!: number;

  @Expose()
  profit!: number;

  @Expose()
  notes?: string;

  @Expose()
  palcedBy!: string;

  @Expose()
  supplierId!: string;
}
