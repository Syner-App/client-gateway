import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import type { Role } from '../../generated/proto/auth.ts';
import { enumMessage } from '../../common/index.ts';
import { ROLES } from '../roles.ts';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsEmail()
  public email: string;

  // Min 8 chars with at least one lowercase, uppercase, number and symbol
  @IsString()
  @IsStrongPassword()
  public password: string;

  // Defaults to user. An admin can only register users; an owner, any role
  @IsOptional()
  @IsIn(ROLES, { message: enumMessage('role', ROLES) })
  public role?: Role;
}
