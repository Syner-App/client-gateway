import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../../generated/proto/auth.ts';
import { ROLES_KEY } from '../roles.ts';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.ts';

// Runs after AuthGuard (request.user is the verified user with its current role in the
// organization the token is scoped to). Routes behind @Auth() work on an organization's
// data, so a token without organization (superadmin, or a user who has not picked one
// yet) is rejected
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user.organization_id || !user.role) {
      throw new ForbiddenException('Select an organization first (POST /api/auth/switch-organization)');
    }

    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // No roles listed: any member of the organization
    if (!roles?.length) return true;

    if (!roles.includes(user.role)) {
      throw new ForbiddenException(`Requires one of the roles: ${roles.join(', ')}`);
    }
    return true;
  }
}
