import {
  Body,
  Controller,
  Delete,
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
  ORGANIZATIONS_SERVICE_NAME,
  type OrganizationsServiceClient,
  Role,
  type User as UserResponse,
} from '../generated/proto/auth.ts';
import { AddMemberDto, UpdateCurrentOrganizationDto } from './dtos/index.ts';
import { Auth, OrganizationId, Roles, User } from '../auth/decorators/index.ts';
import { MANAGER_ROLES } from '../auth/roles.ts';

// The caller's own organization (from its token), for its owner and admins. auth-ms checks
// the caller's role again and applies the admin limits: an admin only adds and removes
// members with role user, and only the owner renames the organization
@Auth(...MANAGER_ROLES)
@ApiTags('Current organization')
@Controller('organization')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class CurrentOrganizationController implements OnModuleInit {
  private organizationsService: OrganizationsServiceClient;

  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.organizationsService =
      this.client.getService<OrganizationsServiceClient>(ORGANIZATIONS_SERVICE_NAME);
  }

  @Get()
  findCurrent(@User() user: UserResponse, @OrganizationId() organization_id: string) {
    return this.organizationsService.findCurrent({ requester_id: user.id, organization_id });
  }

  /** Owner only */
  @Roles(Role.owner)
  @Patch()
  updateCurrent(
    @Body() { name }: UpdateCurrentOrganizationDto,
    @User() user: UserResponse,
    @OrganizationId() organization_id: string,
  ) {
    return this.organizationsService.updateCurrent({ requester_id: user.id, organization_id, name });
  }

  @Get('members')
  findMembers(@User() user: UserResponse, @OrganizationId() organization_id: string) {
    return this.organizationsService.findCurrentMembers({ requester_id: user.id, organization_id });
  }

  /**
   * Creates the user when the email is unknown (name and password required), then the
   * membership. An admin can only add members with role user
   */
  @Post('members')
  addMember(
    @Body() addMemberDto: AddMemberDto,
    @User() user: UserResponse,
    @OrganizationId() organization_id: string,
  ) {
    return this.organizationsService.addCurrentMember({ ...addMemberDto, requester_id: user.id, organization_id });
  }

  /** Nobody removes themselves. An admin can only remove members with role user */
  @Delete('members/:userId')
  removeMember(
    @Param('userId') user_id: string,
    @User() user: UserResponse,
    @OrganizationId() organization_id: string,
  ) {
    return this.organizationsService.removeCurrentMember({ requester_id: user.id, organization_id, user_id });
  }
}
