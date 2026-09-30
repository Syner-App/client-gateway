import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuthController } from './auth.controller.ts';
import { AuthGuard } from './guards/auth.guard.ts';
import { RolesGuard } from './guards/roles.guard.ts';
import { AUTH_SERVICE } from '../config/index.ts';
import { Role } from '../generated/proto/auth.ts';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    verify: vi.fn(),
    updateUserRole: vi.fn(),
  };

  const owner = { id: 'owner-id', name: 'Olga', email: 'owner@syner.com', role: Role.owner };

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

  it('forwards register to auth-ms with the caller role', () => {
    const dto = { name: 'Ana', email: 'ana@syner.com', password: 'Str0ng!Pass', role: Role.admin };
    const response = of({ user: { id: '1', name: 'Ana', email: 'ana@syner.com', role: Role.admin }, token: 't' });
    authService.registerUser.mockReturnValue(response);

    expect(controller.registerUser(dto, owner)).toBe(response);
    expect(authService.registerUser).toHaveBeenCalledWith({ ...dto, requester_role: Role.owner });
  });

  it('forwards login to auth-ms', () => {
    const dto = { email: 'ana@syner.com', password: 'Str0ng!Pass' };
    controller.loginUser(dto);
    expect(authService.loginUser).toHaveBeenCalledWith(dto);
  });

  it('returns the user and renewed token set by AuthGuard', () => {
    const user = { id: '1', name: 'Ana', email: 'ana@syner.com', role: Role.user };
    expect(controller.verifyToken(user, 'renewed')).toEqual({ user, token: 'renewed' });
  });

  it('forwards the role change with the target id and the caller id', () => {
    controller.updateUserRole('user-id', { role: Role.admin }, owner);
    expect(authService.updateUserRole).toHaveBeenCalledWith({
      user_id: 'user-id',
      role: Role.admin,
      requester_id: 'owner-id',
    });
  });
});
