import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../../generated/proto/auth.ts';
import { ROLES_KEY } from '../roles.ts';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.ts';

// Runs after AuthGuard (request.user is the verified user with its current role)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // No roles listed: any authenticated user
    if (!roles?.length) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!roles.includes(user.role)) {
      throw new ForbiddenException(`Requires one of the roles: ${roles.join(', ')}`);
    }
    return true;
  }
}
