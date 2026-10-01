import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Role } from '../../generated/proto/auth.ts';
import { AuthGuard } from '../guards/auth.guard.ts';
import { PlatformAdminGuard } from '../guards/platform-admin.guard.ts';
import { RolesGuard } from '../guards/roles.guard.ts';
import { ROLES_KEY } from '../roles.ts';

// Roles allowed on a handler or controller. Only metadata: it needs @Auth() on the
// controller (or handler) to be enforced. Handler roles override controller roles
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// OpenAPI: bearer token required (401 without a valid one)
const ApiAuth = () =>
  applyDecorators(ApiBearerAuth(), ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' }));

// Organization routes: requires a valid bearer token scoped to an organization and, when
// roles are given, one of them in that organization. Use it once per route: on the
// controller plus @Roles() on handlers, since repeating it on a handler would run
// AuthGuard (a gRPC call) twice
export const Auth = (...roles: Role[]) =>
  applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiAuth(),
    ApiForbiddenResponse({ description: 'No organization selected, or role not allowed' }),
  );

// Any valid bearer token, with or without organization (verify, switch-organization)
export const Authenticated = () => applyDecorators(UseGuards(AuthGuard), ApiAuth());

// Platform routes: requires a valid bearer token of the superadmin
export const PlatformAdmin = () =>
  applyDecorators(
    UseGuards(AuthGuard, PlatformAdminGuard),
    ApiAuth(),
    ApiForbiddenResponse({ description: 'Platform superadmin only' }),
  );
