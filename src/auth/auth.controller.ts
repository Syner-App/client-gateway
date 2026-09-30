import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../config/index.ts';
import {
  AUTH_SERVICE_NAME,
  type AuthServiceClient,
  Role,
  type User as UserResponse,
} from '../generated/proto/auth.ts';
import { LoginUserDto, RegisterUserDto, UpdateUserRoleDto } from './dtos/index.ts';
import { Auth, Token, User } from './decorators/index.ts';
import { MANAGER_ROLES } from './roles.ts';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AuthController implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  // Only owner/admin register users; auth-ms checks which roles the caller may assign
  @Auth(...MANAGER_ROLES)
  @Post('register')
  registerUser(@Body() { name, email, password, role }: RegisterUserDto, @User() user: UserResponse) {
    return this.authService.registerUser({ name, email, password, role, requester_role: user.role });
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  // AuthGuard already verified the token with auth-ms and got a renewed one
  @Auth()
  @Get('verify')
  verifyToken(@User() user: UserResponse, @Token() token: string) {
    return { user, token };
  }

  // Owner only. auth-ms rejects changing your own role
  @Auth(Role.owner)
  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() { role }: UpdateUserRoleDto,
    @User() user: UserResponse,
  ) {
    return this.authService.updateUserRole({ user_id: id, role, requester_id: user.id });
  }
}
