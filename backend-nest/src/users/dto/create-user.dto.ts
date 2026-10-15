import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Roles } from '../../utils/roles';

const SELF_REGISTERABLE_ROLES = [
  Roles.customer,
  Roles.supplier,
  Roles.dropshipper,
];

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must consist of 3 or more characters' })
  @MaxLength(100, { message: 'Name must be at most 100 characters long' })
  name!: string;

  @IsEmail({}, { message: 'Incorrect email format' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsOptional()
  @IsIn(SELF_REGISTERABLE_ROLES, { message: 'Incorrect role' })
  role?: Roles;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  shopUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  salesChannel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  experience?: string;
}
