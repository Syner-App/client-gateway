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
import { LoginUserDto, SwitchOrganizationDto, UpdateUserRoleDto } from './dtos/index.ts';
import { Auth, Authenticated, OrganizationId, Token, User } from './decorators/index.ts';

// Users are created by the platform superadmin (POST /api/organizations/:id/members)
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AuthController implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  // Returns the token and the active memberships. With a single membership (or with
  // organization_id) the token is already scoped to an organization
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  // Returns a token scoped to another organization the caller belongs to
  @Authenticated()
  @Post('switch-organization')
  switchOrganization(@Body() { organization_id }: SwitchOrganizationDto, @User() user: UserResponse) {
    return this.authService.switchOrganization({ requester_id: user.id, organization_id });
  }

  // AuthGuard already verified the token with auth-ms and got a renewed one
  @Authenticated()
  @Get('verify')
  verifyToken(@User() user: UserResponse, @Token() token: string) {
    return { user, token };
  }

  // Owner of the active organization only. auth-ms rejects changing your own role
  @Auth(Role.owner)
  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() { role }: UpdateUserRoleDto,
    @User() user: UserResponse,
    @OrganizationId() organization_id: string,
  ) {
    return this.authService.updateUserRole({ user_id: id, role, requester_id: user.id, organization_id });
  }
}
