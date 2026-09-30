import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants.js';
import { OrganizationsController } from './organizations.controller.ts';
import { AUTH_SERVICE } from '../config/index.ts';
import { AuthGuard } from '../auth/guards/auth.guard.ts';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard.ts';
import { OrganizationStatus, PlatformRole, Role } from '../generated/proto/auth.ts';

const organization_id = '6abd26a42d059ac027376ca1';
const superadmin = { id: 'root-id', name: 'Root', email: 'root@syner.com', platform_role: PlatformRole.superadmin };

describe('OrganizationsController', () => {
  let controller: OrganizationsController;

  const organizationsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    updateStatus: vi.fn(),
    addMember: vi.fn(),
    findMembers: vi.fn(),
    removeMember: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        { provide: AUTH_SERVICE, useValue: { getService: () => organizationsService } },
        AuthGuard,
        PlatformAdminGuard,
      ],
    }).compile();

    controller = module.get(OrganizationsController);
    controller.onModuleInit();
  });

  it('is restricted to the superadmin', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, OrganizationsController)).toEqual([AuthGuard, PlatformAdminGuard]);
  });

  it('forwards create with the caller id', () => {
    controller.createOrganization({ name: 'Acme', slug: 'acme' }, superadmin);
    expect(organizationsService.create).toHaveBeenCalledWith({ requester_id: 'root-id', name: 'Acme', slug: 'acme' });
  });

  it('forwards the status change', () => {
    controller.updateOrganizationStatus(organization_id, { status: OrganizationStatus.SUSPENDED }, superadmin);
    expect(organizationsService.updateStatus).toHaveBeenCalledWith({
      requester_id: 'root-id',
      id: organization_id,
      status: OrganizationStatus.SUSPENDED,
    });
  });

  it('forwards a new member with the organization from the route', () => {
    const dto = { email: 'ana@syner.com', role: Role.admin, name: 'Ana', password: 'Str0ng!Pass' };

    controller.addMember(organization_id, dto, superadmin);

    expect(organizationsService.addMember).toHaveBeenCalledWith({ ...dto, requester_id: 'root-id', organization_id });
  });

  it('forwards the member removal', () => {
    controller.removeMember(organization_id, 'user-id', superadmin);
    expect(organizationsService.removeMember).toHaveBeenCalledWith({
      requester_id: 'root-id',
      organization_id,
      user_id: 'user-id',
    });
  });
});
