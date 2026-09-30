import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PlatformAdminGuard } from './platform-admin.guard.ts';
import { PlatformRole, Role } from '../../generated/proto/auth.ts';

const buildContext = (user: Record<string, unknown>) =>
  ({ switchToHttp: () => ({ getRequest: () => ({ user: { id: '1', ...user } }) }) }) as unknown as ExecutionContext;

describe('PlatformAdminGuard', () => {
  const guard = new PlatformAdminGuard();

  it('lets the superadmin through', () => {
    expect(guard.canActivate(buildContext({ platform_role: PlatformRole.superadmin }))).toBe(true);
  });

  it('rejects an organization owner with 403', () => {
    expect(() =>
      guard.canActivate(buildContext({ organization_id: '6abd26a42d059ac027376ca1', role: Role.owner })),
    ).toThrow(ForbiddenException);
  });
});
