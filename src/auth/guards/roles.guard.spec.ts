import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.ts';
import { Role } from '../../generated/proto/auth.ts';
import { ROLES_KEY } from '../roles.ts';

const organization_id = '6abd26a42d059ac027376ca1';

const buildContext = (user: Record<string, unknown>, handlerRoles?: Role[], classRoles?: Role[]) => {
  const handler = () => undefined;
  class Controller {}
  if (handlerRoles) Reflect.defineMetadata(ROLES_KEY, handlerRoles, handler);
  if (classRoles) Reflect.defineMetadata(ROLES_KEY, classRoles, Controller);

  return {
    getHandler: () => handler,
    getClass: () => Controller,
    switchToHttp: () => ({ getRequest: () => ({ user: { id: '1', ...user } }) }),
  } as unknown as ExecutionContext;
};

const member = (role: Role) => ({ organization_id, role });

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('lets any member through when no roles are required', () => {
    expect(guard.canActivate(buildContext(member(Role.user)))).toBe(true);
    expect(guard.canActivate(buildContext(member(Role.user), [], []))).toBe(true);
  });

  it('allows a member whose role is listed', () => {
    expect(guard.canActivate(buildContext(member(Role.admin), [Role.owner, Role.admin]))).toBe(true);
  });

  it('rejects a member whose role is not listed with 403', () => {
    expect(() => guard.canActivate(buildContext(member(Role.user), [Role.owner, Role.admin]))).toThrow(
      ForbiddenException,
    );
  });

  it('uses the handler roles over the controller roles', () => {
    expect(guard.canActivate(buildContext(member(Role.user), [Role.user], [Role.owner]))).toBe(true);
    expect(() => guard.canActivate(buildContext(member(Role.admin), [Role.owner], [Role.admin]))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects a token without organization with 403, even when no roles are required', () => {
    expect(() => guard.canActivate(buildContext({ platform_role: 'superadmin' }))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(buildContext({}))).toThrow('Select an organization first');
  });
});
