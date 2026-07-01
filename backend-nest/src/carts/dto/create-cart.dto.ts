import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString, IsUUID, Min } from 'class-validator';

@Exclude()
export class CreateCartDto {
  @Expose()
  @IsUUID('4')
  userId!: string;

  @Expose()
  @IsString()
  productId!: string;

  @Expose()
  @IsInt()
  @Min(1)
  quantity!: number;
}
