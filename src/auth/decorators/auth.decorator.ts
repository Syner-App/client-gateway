import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import type { Role } from '../../generated/proto/auth.ts';
import { AuthGuard } from '../guards/auth.guard.ts';
import { RolesGuard } from '../guards/roles.guard.ts';
import { ROLES_KEY } from '../roles.ts';

// Roles allowed on a handler or controller. Only metadata: it needs @Auth() on the
// controller (or handler) to be enforced. Handler roles override controller roles
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Requires a valid bearer token and, when roles are given, one of them.
// Use it once per route: on the controller plus @Roles() on handlers, since
// repeating it on a handler would run AuthGuard (a gRPC call) twice
export const Auth = (...roles: Role[]) =>
  applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));
