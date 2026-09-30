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
import { AUTH_SERVICE } from '../config/index.ts';
import {
  ORGANIZATIONS_SERVICE_NAME,
  type OrganizationsServiceClient,
  type User as UserResponse,
} from '../generated/proto/auth.ts';
import { AddMemberDto, CreateOrganizationDto, UpdateOrganizationStatusDto } from './dtos/index.ts';
import { PlatformAdmin, User } from '../auth/decorators/index.ts';

// Platform administration, superadmin only: organizations (tenants) and their members.
// Served by auth-ms, which checks the caller (requester_id) against the database again.
// Invalid ids come back from auth-ms as INVALID_ARGUMENT (400)
@PlatformAdmin()
@Controller('organizations')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class OrganizationsController implements OnModuleInit {
  private organizationsService: OrganizationsServiceClient;

  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.organizationsService =
      this.client.getService<OrganizationsServiceClient>(ORGANIZATIONS_SERVICE_NAME);
  }

  @Post()
  createOrganization(@Body() { name, slug }: CreateOrganizationDto, @User() user: UserResponse) {
    return this.organizationsService.create({ requester_id: user.id, name, slug });
  }

  @Get()
  findAllOrganizations(@User() user: UserResponse) {
    return this.organizationsService.findAll({ requester_id: user.id });
  }

  @Get(':id')
  findOneOrganization(@Param('id') id: string, @User() user: UserResponse) {
    return this.organizationsService.findOne({ requester_id: user.id, id });
  }

  // ACTIVE | SUSPENDED
  @Patch(':id/status')
  updateOrganizationStatus(
    @Param('id') id: string,
    @Body() { status }: UpdateOrganizationStatusDto,
    @User() user: UserResponse,
  ) {
    return this.organizationsService.updateStatus({ requester_id: user.id, id, status });
  }

  @Get(':id/members')
  findMembers(@Param('id') id: string, @User() user: UserResponse) {
    return this.organizationsService.findMembers({ requester_id: user.id, id });
  }

  // Creates the user when the email is unknown (name and password required), then the membership
  @Post(':id/members')
  addMember(@Param('id') organization_id: string, @Body() addMemberDto: AddMemberDto, @User() user: UserResponse) {
    return this.organizationsService.addMember({ ...addMemberDto, requester_id: user.id, organization_id });
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') organization_id: string,
    @Param('userId') user_id: string,
    @User() user: UserResponse,
  ) {
    return this.organizationsService.removeMember({ requester_id: user.id, organization_id, user_id });
  }
}
