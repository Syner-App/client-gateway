import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.ts';

// Requires AuthGuard on the route
export const User = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!user) {
    throw new InternalServerErrorException('User not found in request (is AuthGuard applied?)');
  }
  return user;
});
