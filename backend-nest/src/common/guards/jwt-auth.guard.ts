import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      const request = context
        .switchToHttp()
        .getRequest<Request & { user?: AuthUser }>();

      this.attachUserIfPresent(request, this.jwtService);

      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      request.user = this.jwtService.verify<AuthUser>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }

  /**
   * Допоміжний метод для публічних ендпоїнтів, де токен НЕ обов'язковий,
   * але авторизований користувач має бути розпізнаний.
   *
   * Без цього @CurrentUser() на @Public() маршруті завжди повертав би
   * undefined: guard виходив раніше і не заповнював request.user.
   * Через це, наприклад, дропшипер не бачив би гуртових цін у GET /products.
   */
  private attachUserIfPresent(
    request: Request & { user?: AuthUser },
    jwtService: JwtService,
  ): void {
    const token = this.extractToken(request);

    if (!token) {
      return;
    }

    try {
      request.user = jwtService.verify<AuthUser>(token);
    } catch {
      request.user = undefined;
    }
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers.authorization;

    if (!header) {
      return undefined;
    }

    const [type, value] = header.split(' ');

    return type === 'Bearer' ? value : undefined;
  }
}
