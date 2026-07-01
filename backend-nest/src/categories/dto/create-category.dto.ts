import { Exclude, Expose } from 'class-transformer';
import { IsString, Length } from 'class-validator';

@Exclude()
export class CreateCategoryDto {
  @Expose()
  @IsString()
  @Length(3, 25)
  name!: string;

  @Expose()
  @IsString()
  @Length(3, 25)
  description?: string;

  @Expose()
  @IsString()
  @Length(3, 255)
  slug!: string;
}
