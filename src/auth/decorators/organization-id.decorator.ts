import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.ts';

// Requires AuthGuard on the route. The organization the verified token is scoped to: every
// call to products-ms and orders-ms carries it, never a value sent by the client
export const OrganizationId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!user) {
    throw new InternalServerErrorException('User not found in request (is AuthGuard applied?)');
  }
  if (!user.organization_id) {
    throw new ForbiddenException('Select an organization first (POST /api/auth/switch-organization)');
  }
  return user.organization_id;
});
