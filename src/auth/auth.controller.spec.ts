import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuthController } from './auth.controller.ts';
import { AuthGuard } from './guards/auth.guard.ts';
import { RolesGuard } from './guards/roles.guard.ts';
import { AUTH_SERVICE } from '../config/index.ts';
import { Role } from '../generated/proto/auth.ts';

const organization_id = '6abd26a42d059ac027376ca1';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    loginUser: vi.fn(),
    switchOrganization: vi.fn(),
    verify: vi.fn(),
    updateUserRole: vi.fn(),
  };

  const owner = { id: 'owner-id', name: 'Olga', email: 'owner@syner.com', organization_id, role: Role.owner };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AUTH_SERVICE, useValue: { getService: () => authService } },
        AuthGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    controller.onModuleInit();
  });

  it('forwards login to auth-ms', () => {
    const dto = { email: 'ana@syner.com', password: 'Str0ng!Pass', organization_id };
    const response = of({ user: { id: '1', name: 'Ana', email: 'ana@syner.com' }, token: 't', memberships: [] });
    authService.loginUser.mockReturnValue(response);

    expect(controller.loginUser(dto)).toBe(response);
    expect(authService.loginUser).toHaveBeenCalledWith(dto);
  });

  it('forwards the organization switch with the caller id', () => {
    const user = { id: 'user-id', name: 'Ana', email: 'ana@syner.com' };

    controller.switchOrganization({ organization_id }, user);

    expect(authService.switchOrganization).toHaveBeenCalledWith({ requester_id: 'user-id', organization_id });
  });

  it('returns the user and renewed token set by AuthGuard', () => {
    const user = { id: '1', name: 'Ana', email: 'ana@syner.com', organization_id, role: Role.user };
    expect(controller.verifyToken(user, 'renewed')).toEqual({ user, token: 'renewed' });
  });

  it('forwards the role change with the target id, the caller id and its organization', () => {
    controller.updateUserRole('user-id', { role: Role.admin }, owner, organization_id);
    expect(authService.updateUserRole).toHaveBeenCalledWith({
      user_id: 'user-id',
      role: Role.admin,
      requester_id: 'owner-id',
      organization_id,
    });
  });
});
