import type { Request } from 'express';
import type { User } from '../../generated/proto/auth.ts';

// Set by AuthGuard after auth-ms verifies the bearer token
export interface AuthenticatedRequest extends Request {
  user: User;
  token: string;
}
