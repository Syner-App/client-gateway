import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { AuthGuard } from './auth.guard.ts';

const buildContext = (request: Record<string, any>) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

describe('AuthGuard', () => {
  const authService = { verify: vi.fn() };
  let guard: AuthGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new AuthGuard({ getService: () => authService } as any);
    guard.onModuleInit();
  });

  it('verifies the bearer token and attaches the user and renewed token', async () => {
    const user = { id: '1', name: 'Ana', email: 'ana@syner.com' };
    authService.verify.mockReturnValue(of({ user, token: 'renewed' }));
    const request: Record<string, any> = { headers: { authorization: 'Bearer old' } };

    await expect(guard.canActivate(buildContext(request))).resolves.toBe(true);
    expect(authService.verify).toHaveBeenCalledWith({ token: 'old' });
    expect(request.user).toEqual(user);
    expect(request.token).toBe('renewed');
  });

  it('rejects a request without a bearer token', async () => {
    await expect(guard.canActivate(buildContext({ headers: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      guard.canActivate(buildContext({ headers: { authorization: 'Basic abc' } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authService.verify).not.toHaveBeenCalled();
  });

  it('propagates the gRPC UNAUTHENTICATED error for an invalid token', async () => {
    const grpcError = { code: status.UNAUTHENTICATED, details: 'Invalid token' };
    authService.verify.mockReturnValue(throwError(() => grpcError));

    await expect(
      guard.canActivate(buildContext({ headers: { authorization: 'Bearer bad' } })),
    ).rejects.toBe(grpcError);
  });
});
