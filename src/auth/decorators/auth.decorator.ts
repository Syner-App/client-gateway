import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import type { Role } from '../../generated/proto/auth.ts';
import { AuthGuard } from '../guards/auth.guard.ts';
import { PlatformAdminGuard } from '../guards/platform-admin.guard.ts';
import { RolesGuard } from '../guards/roles.guard.ts';
import { ROLES_KEY } from '../roles.ts';

// Roles allowed on a handler or controller. Only metadata: it needs @Auth() on the
// controller (or handler) to be enforced. Handler roles override controller roles
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Organization routes: requires a valid bearer token scoped to an organization and, when
// roles are given, one of them in that organization. Use it once per route: on the
// controller plus @Roles() on handlers, since repeating it on a handler would run
// AuthGuard (a gRPC call) twice
export const Auth = (...roles: Role[]) =>
  applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));

// Any valid bearer token, with or without organization (verify, switch-organization)
export const Authenticated = () => UseGuards(AuthGuard);

// Platform routes: requires a valid bearer token of the superadmin
export const PlatformAdmin = () => UseGuards(AuthGuard, PlatformAdminGuard);
