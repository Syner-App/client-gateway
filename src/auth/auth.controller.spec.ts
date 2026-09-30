import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuthController } from './auth.controller.ts';
import { AuthGuard } from './guards/auth.guard.ts';
import { AUTH_SERVICE } from '../config/index.ts';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    verify: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AUTH_SERVICE, useValue: { getService: () => authService } },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    controller.onModuleInit();
  });

  it('forwards register to auth-ms', () => {
    const dto = { name: 'Ana', email: 'ana@syner.com', password: 'Str0ng!Pass' };
    const response = of({ user: { id: '1', name: 'Ana', email: 'ana@syner.com' }, token: 't' });
    authService.registerUser.mockReturnValue(response);

    expect(controller.registerUser(dto)).toBe(response);
    expect(authService.registerUser).toHaveBeenCalledWith(dto);
  });

  it('forwards login to auth-ms', () => {
    const dto = { email: 'ana@syner.com', password: 'Str0ng!Pass' };
    controller.loginUser(dto);
    expect(authService.loginUser).toHaveBeenCalledWith(dto);
  });

  it('returns the user and renewed token set by AuthGuard', () => {
    const user = { id: '1', name: 'Ana', email: 'ana@syner.com' };
    expect(controller.verifyToken(user, 'renewed')).toEqual({ user, token: 'renewed' });
  });
});
