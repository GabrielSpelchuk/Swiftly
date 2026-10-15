import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

const toNumberOrUndefined = ({ value }: { value: unknown }) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? value : parsed;
};

/**
 * Клієнт надсилає порожні значення для незаповнених фільтрів:
 *   ?search=&categoryId=&minPrice=&maxPrice=
 *
 * Раніше це ламало каталог:
 *   - categoryId="" не проходив @IsUUID() -> 400 на КОЖЕН запит;
 *   - minPrice="" через @Type(() => Number) перетворювався на 0,
 *     тому фільтр виглядав як "ціна від 0 до 0" -> 0 товарів.
 *
 * Порожній рядок тепер означає "фільтр не заданий".
 */
export class GetProductQueryDto {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID('4', { message: 'categoryId must be a UUID' })
  categoryId?: string;

  @Transform(toNumberOrUndefined)
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'minPrice must be a number' },
  )
  @Min(0)
  minPrice?: number;

  @Transform(toNumberOrUndefined)
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'maxPrice must be a number' },
  )
  @Min(0)
  maxPrice?: number;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  search?: string;

  @Transform(toNumberOrUndefined)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @Transform(toNumberOrUndefined)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100, { message: 'limit must not exceed 100' })
  limit: number = 12;
}