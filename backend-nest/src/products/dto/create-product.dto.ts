import { Exclude, Expose } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@Exclude()
export class CreateProductDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  wholesalePrice!: number;

  @Expose()
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  retailPrice!: number;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @Expose()
  @IsOptional()
  @IsString()
  category?: string;
}
