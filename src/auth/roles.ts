import { Role } from '../generated/proto/auth.ts';
import { enumValues } from '../common/index.ts';

export const ROLES = enumValues(Role);

// Roles allowed to create, edit and delete products and purchase orders
export const MANAGER_ROLES = [Role.owner, Role.admin] as const;

// Metadata key set by @Auth(...roles) and read by RolesGuard
export const ROLES_KEY = 'roles';
