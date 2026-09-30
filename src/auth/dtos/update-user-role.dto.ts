import { IsIn } from 'class-validator';
import type { Role } from '../../generated/proto/auth.ts';
import { enumMessage } from '../../common/index.ts';
import { ROLES } from '../roles.ts';

export class UpdateUserRoleDto {
  @IsIn(ROLES, { message: enumMessage('role', ROLES) })
  public role: Role;
}
