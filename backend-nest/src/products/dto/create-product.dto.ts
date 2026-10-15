import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0)
  wholesalePrice!: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0)
  retailPrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // Назва поля збігається з entity (Product.categoryId) і з тим,
  // що бекенд повертає у відповіді. Раніше тут було "category" —
  // через що фронтенд (який надсилає categoryId) отримував
  // 400 "property categoryId should not exist" на кожному створенні.
  //
  // Значення — рядок UUID. number() тут неприпустимий: Number(uuid) = NaN.
  @IsOptional()
  @IsUUID('4', { message: 'categoryId must be a UUID or null' })
  categoryId?: string | null;
}
