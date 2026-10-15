import { randomBytes, randomUUID } from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Roles } from '../utils/roles';
import { LoginDto, ForgotPasswordDto } from './dto/auth.dto';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: CreateUserDto): Promise<{ message: string }> {
    const user = await this.usersService.register(dto);
    const activationToken = user.activationToken;

    if (activationToken) {
      await this.mailService.sendActivationEmail(user.email, activationToken);
    }

    return {
      message:
        user.role === Roles.dropshipper
          ? 'Registration successful. Activate your email, then wait for admin approval.'
          : 'Registration successful. Please check your email to activate your account.',
    };
  }

  async activate(token: string): Promise<{ message: string }> {
    await this.usersService.activate(token);
    return { message: 'Account activated successfully' };
  }

  async login(dto: LoginDto): Promise<{ user: User; accessToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.activationToken) {
      throw new BadRequestException('Please activate your account first');
    }

    if (user.isBlocked) {
      throw new ForbiddenException('Your account has been blocked');
    }

    const valid = await bcrypt.compare(
      dto.password,
      await this.getPassword(user.id),
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user,
      accessToken: await this.generateAccessToken(user),
    };
  }

  async issueTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    await this.tokensService.save(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ user: User; accessToken: string }> {
    let payload: TokenPayload;

    try {
      payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const stored = await this.tokensService.findByToken(refreshToken);

    if (!stored || stored.userId !== payload.id) {
      throw new UnauthorizedException('Refresh token is not recognised');
    }

    const user = await this.usersService.findById(payload.id);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (user.isBlocked) {
      throw new ForbiddenException('Your account has been blocked');
    }

    // Refresh-токен тут НЕ ротується — оновлюється лише access.
    //
    // Чому: будь-який паралельний запит (дві вкладки, React.StrictMode
    // подвоює ефекти в dev, axios-інтерцептор.refresh після 401) приводить
    // до того, що другий запит приходить зі старим токеном, якого вже
    // немає в базі, — і сесія руйнується. Ротація без "grace period"
    // на повторний запит — це баг, а не безпека.
    return {
      user,
      accessToken: await this.generateAccessToken(user),
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.tokensService.removeByToken(refreshToken);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (user) {
      const resetToken = randomBytes(32).toString('hex');

      await this.usersService.updateResetToken(user.id, resetToken);
      await this.mailService.sendResetPasswordEmail(user.email, resetToken);
    }

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.usersService.updatePassword(user.id, hashed);
    await this.tokensService.removeByUserId(user.id);

    return { message: 'Password reset successfully' };
  }

  private async getPassword(userId: string): Promise<string> {
    const withPassword = await this.usersService.findWithPassword(userId);

    if (!withPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return withPassword.password;
  }

  private toPayload(user: User): TokenPayload {
    return { id: user.id, email: user.email, role: user.role, name: user.name };
  }

  private generateAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync(this.toPayload(user), {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') ??
        '15m') as StringValue,
    });
  }

  private generateRefreshToken(user: User): Promise<string> {
    return this.jwtService.signAsync(this.toPayload(user), {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ??
        '30d') as StringValue,
      jwtid: randomUUID(),
    });
  }
}
