import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.ts';

// Requires AuthGuard on the route. Returns the renewed token issued by auth-ms
export const Token = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const { token } = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!token) {
    throw new InternalServerErrorException('Token not found in request (is AuthGuard applied?)');
  }
  return token;
});
