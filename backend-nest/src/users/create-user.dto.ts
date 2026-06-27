import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Roles } from 'src/utils/roles';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must consist of 3 or more characters' })
  name!: string;

  @IsEmail({}, { message: 'Incorrect email format' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsOptional()
  @IsEnum(Roles, { message: 'Incorrect role' })
  role?: Roles;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  shopUrl?: string;

  @IsOptional()
  @IsString()
  salesChannel?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsBoolean()
  isApproved?: boolean;
}
