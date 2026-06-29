import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreateProductDto {
  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose()
  wholesalePrice!: number;

  @Expose()
  retailPrice!: number;

  @Expose()
  stock!: number;

  @Expose()
  images?: string[];
}
