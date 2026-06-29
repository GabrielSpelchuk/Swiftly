import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @Expose()
  name?: string;

  @Expose()
  slug?: string;

  @Expose()
  description?: string;
}
