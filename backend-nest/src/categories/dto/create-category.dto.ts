import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreateCategoryDto {
  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose()
  slug!: string;
}
