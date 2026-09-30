import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.ts';
import { Role } from '../../generated/proto/auth.ts';
import { ROLES_KEY } from '../roles.ts';

const buildContext = (role: Role, handlerRoles?: Role[], classRoles?: Role[]) => {
  const handler = () => undefined;
  class Controller {}
  if (handlerRoles) Reflect.defineMetadata(ROLES_KEY, handlerRoles, handler);
  if (classRoles) Reflect.defineMetadata(ROLES_KEY, classRoles, Controller);

  return {
    getHandler: () => handler,
    getClass: () => Controller,
    switchToHttp: () => ({ getRequest: () => ({ user: { id: '1', role } }) }),
  } as unknown as ExecutionContext;
};

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('lets any authenticated user through when no roles are required', () => {
    expect(guard.canActivate(buildContext(Role.user))).toBe(true);
    expect(guard.canActivate(buildContext(Role.user, [], []))).toBe(true);
  });

  it('allows a user whose role is listed', () => {
    expect(guard.canActivate(buildContext(Role.admin, [Role.owner, Role.admin]))).toBe(true);
  });

  it('rejects a user whose role is not listed with 403', () => {
    expect(() => guard.canActivate(buildContext(Role.user, [Role.owner, Role.admin]))).toThrow(
      ForbiddenException,
    );
  });

  it('uses the handler roles over the controller roles', () => {
    expect(guard.canActivate(buildContext(Role.user, [Role.user], [Role.owner]))).toBe(true);
    expect(() => guard.canActivate(buildContext(Role.admin, [Role.owner], [Role.admin]))).toThrow(
      ForbiddenException,
    );
  });
});
