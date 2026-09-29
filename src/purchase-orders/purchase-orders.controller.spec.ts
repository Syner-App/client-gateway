import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersController } from './purchase-orders.controller.ts';
import { ORDERS_SERVICE } from '../config/index.ts';

describe('PurchaseOrdersController', () => {
  let controller: PurchaseOrdersController;
  const purchaseOrdersService = { updateStatus: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
      providers: [
        { provide: ORDERS_SERVICE, useValue: { getService: () => purchaseOrdersService } },
      ],
    }).compile();

    controller = module.get<PurchaseOrdersController>(PurchaseOrdersController);
    controller.onModuleInit();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('sends the id from the route and the estado/motivo from the body', () => {
    const id = '6f1c1c9e-2f5b-4c1a-9a47-6a2b1f3c8d10';

    controller.updateStatusPurchase(id, { estado: 'RECHAZADA' as never, motivo: 'Sin presupuesto' });

    expect(purchaseOrdersService.updateStatus).toHaveBeenCalledWith({
      id,
      estado: 'RECHAZADA',
      motivo: 'Sin presupuesto',
    });
  });
});
