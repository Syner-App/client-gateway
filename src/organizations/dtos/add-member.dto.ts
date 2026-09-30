import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import type { Role } from '../../generated/proto/auth.ts';
import { enumMessage } from '../../common/index.ts';
import { ROLES } from '../../auth/roles.ts';

export class AddMemberDto {
  @IsEmail()
  public email: string;

  @IsIn(ROLES, { message: enumMessage('role', ROLES) })
  public role: Role;

  // Only used (and then required) when no user has this email yet; an existing user
  // keeps its name and password
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public name?: string;

  // Min 8 chars with at least one lowercase, uppercase, number and symbol
  @IsOptional()
  @IsString()
  @IsStrongPassword()
  public password?: string;
}
