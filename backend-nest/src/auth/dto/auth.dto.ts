import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Incorrect email format' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Incorrect email format' })
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(16, { message: 'Reset token is required' })
  token!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(72)
  newPassword!: string;
}

export class ActivationTokenDto {
  @IsString()
  token!: string;
}
