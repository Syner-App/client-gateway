import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants.js';
import { CurrentOrganizationController } from './current-organization.controller.ts';
import { AUTH_SERVICE } from '../config/index.ts';
import { AuthGuard } from '../auth/guards/auth.guard.ts';
import { RolesGuard } from '../auth/guards/roles.guard.ts';
import { Role } from '../generated/proto/auth.ts';
import { ROLES_KEY } from '../auth/roles.ts';

const organization_id = '6abd26a42d059ac027376ca1';
const owner = { id: 'owner-id', name: 'Olga', email: 'olga@syner.com', organization_id, role: Role.owner };

describe('CurrentOrganizationController', () => {
  let controller: CurrentOrganizationController;

  const organizationsService = {
    findCurrent: vi.fn(),
    updateCurrent: vi.fn(),
    findCurrentMembers: vi.fn(),
    addCurrentMember: vi.fn(),
    removeCurrentMember: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrentOrganizationController],
      providers: [
        { provide: AUTH_SERVICE, useValue: { getService: () => organizationsService } },
        AuthGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get(CurrentOrganizationController);
    controller.onModuleInit();
  });

  it('is restricted to owners and admins, and renaming to owners', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, CurrentOrganizationController)).toEqual([AuthGuard, RolesGuard]);
    expect(Reflect.getMetadata(ROLES_KEY, CurrentOrganizationController)).toEqual([Role.owner, Role.admin]);
    const updateCurrent = Object.getOwnPropertyDescriptor(CurrentOrganizationController.prototype, 'updateCurrent');
    expect(Reflect.getMetadata(ROLES_KEY, updateCurrent?.value as object)).toEqual([Role.owner]);
  });

  it('forwards the rename with the organization from the token', () => {
    controller.updateCurrent({ name: 'Acme Foods' }, owner, organization_id);
    expect(organizationsService.updateCurrent).toHaveBeenCalledWith({
      requester_id: 'owner-id',
      organization_id,
      name: 'Acme Foods',
    });
  });

  it('forwards a new member with the organization from the token', () => {
    const dto = { email: 'ana@syner.com', role: Role.user };

    controller.addMember(dto, owner, organization_id);

    expect(organizationsService.addCurrentMember).toHaveBeenCalledWith({
      ...dto,
      requester_id: 'owner-id',
      organization_id,
    });
  });

  it('forwards the member removal', () => {
    controller.removeMember('user-id', owner, organization_id);
    expect(organizationsService.removeCurrentMember).toHaveBeenCalledWith({
      requester_id: 'owner-id',
      organization_id,
      user_id: 'user-id',
    });
  });
});
