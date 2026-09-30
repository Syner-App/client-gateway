import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '../../config/index.ts';
import { AUTH_SERVICE_NAME, type AuthServiceClient } from '../../generated/proto/auth.ts';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.ts';

// Verifies the `Authorization: Bearer <token>` header against auth-ms and exposes
// the user and a renewed token on the request (@User() / @Token())
@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    // An invalid token comes back as gRPC UNAUTHENTICATED, which GrpcExceptionFilter maps to 401
    const { user, token: renewedToken } = await firstValueFrom(this.authService.verify({ token }));
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = user;
    request.token = renewedToken;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
