import type { Request } from 'express';
import type { User } from '../../generated/proto/auth.ts';

// Set by AuthGuard after auth-ms verifies the bearer token. user.organization_id and
// user.role describe the organization the token is scoped to (absent when it has none)
export interface AuthenticatedRequest extends Request {
  user: User;
  token: string;
}
