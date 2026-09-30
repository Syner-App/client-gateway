import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersController } from './purchase-orders.controller.ts';
import { Reflector } from '@nestjs/core';
import { AUTH_SERVICE, ORDERS_SERVICE } from '../config/index.ts';
import { AuthGuard } from '../auth/guards/auth.guard.ts';
import { RolesGuard } from '../auth/guards/roles.guard.ts';
import { ROLES_KEY } from '../auth/roles.ts';
import { Role } from '../generated/proto/auth.ts';

const rolesOf = (handler: keyof PurchaseOrdersController) =>
  new Reflector().getAllAndOverride<Role[]>(ROLES_KEY, [
    PurchaseOrdersController.prototype[handler],
    PurchaseOrdersController,
  ]);

describe('PurchaseOrdersController', () => {
  let controller: PurchaseOrdersController;
  const purchaseOrdersService = { updateStatus: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
      providers: [
        { provide: ORDERS_SERVICE, useValue: { getService: () => purchaseOrdersService } },
        { provide: AUTH_SERVICE, useValue: { getService: () => ({}) } },
        AuthGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<PurchaseOrdersController>(PurchaseOrdersController);
    controller.onModuleInit();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('sends the id from the route, the estado/motivo from the body and the organization of the token', () => {
    const id = '6f1c1c9e-2f5b-4c1a-9a47-6a2b1f3c8d10';
    const organization_id = '6abd26a42d059ac027376ca1';

    controller.updateStatusPurchase(id, { estado: 'RECHAZADA' as never, motivo: 'Sin presupuesto' }, organization_id);

    expect(purchaseOrdersService.updateStatus).toHaveBeenCalledWith({
      id,
      estado: 'RECHAZADA',
      motivo: 'Sin presupuesto',
      organization_id,
    });
  });

  it.each(['findAllPurchaseOrders', 'findOnePurchaseOrder'] as const)('lets any role use %s', (handler) => {
    expect(rolesOf(handler)).toEqual([]);
  });

  it.each(['createPurchaseOrder', 'updateStatusPurchase'] as const)('restricts %s to owner and admin', (handler) => {
    expect(rolesOf(handler)).toEqual([Role.owner, Role.admin]);
  });
});
