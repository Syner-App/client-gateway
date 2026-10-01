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
import { ApiTags } from '@nestjs/swagger';
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
@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AuthController implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  /**
   * Returns the token and the active memberships. With a single membership (or with
   * organization_id) the token is already scoped to an organization
   */
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  /** Returns a token scoped to another organization the caller belongs to */
  @Authenticated()
  @Post('switch-organization')
  switchOrganization(@Body() { organization_id }: SwitchOrganizationDto, @User() user: UserResponse) {
    return this.authService.switchOrganization({ requester_id: user.id, organization_id });
  }

  /**
   * Returns the current user, a renewed token and the active memberships (to pick an
   * organization again after a reload)
   */
  @Authenticated()
  @Get('verify')
  verifyToken(@Token() token: string) {
    // AuthGuard already verified it; verified again for the memberships
    return this.authService.verify({ token, include_memberships: true });
  }

  /** Owner of the active organization only. auth-ms rejects changing your own role */
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
