import { Exclude, Expose, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@Exclude()
export class GetProductQueryDto {
  @Expose()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @Expose()
  @IsOptional()
  @IsString()
  search?: string;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(4)
  limit?: number = 12;
}
