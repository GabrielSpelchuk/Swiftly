import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { Exclude, Expose } from 'class-transformer';
import { IsString, Length } from 'class-validator';

@Exclude()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @Expose()
  @IsString()
  @Length(3, 25)
  name?: string;

  @Expose()
  @IsString()
  @Length(3, 25)
  slug?: string;

  @Expose()
  @IsString()
  @Length(3, 255)
  description?: string;
}
