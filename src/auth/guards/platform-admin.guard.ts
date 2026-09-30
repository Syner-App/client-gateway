import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PlatformRole } from '../../generated/proto/auth.ts';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.ts';

// Runs after AuthGuard. Platform administration (organizations and their members) is for
// the superadmin only; auth-ms checks it again against the database
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (user.platform_role !== PlatformRole.superadmin) {
      throw new ForbiddenException('Requires the platform superadmin');
    }
    return true;
  }
}
