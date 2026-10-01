import { AlertEventsController, AlertSocketEvents } from './alert-events.controller.ts';

const organization_id = '6abd26a42d059ac027376ca1';
const alert = {
  id: '0f8fad5b-d9cb-469f-a165-70867728950e',
  organization_id,
  product_id: 4,
  tipo: 'STOCK_BAJO',
  estado: 'ACTIVA',
  descripcion: 'Stock bajo',
  createdAt: '2026-10-01T10:00:00.000Z',
};

describe('AlertEventsController', () => {
  const notifications = { emitToOrganization: vi.fn() };
  const controller = new AlertEventsController(notifications as never);

  beforeEach(() => vi.clearAllMocks());

  it('pushes created alerts to the organization', () => {
    controller.handleAlertCreated({ organization_id, alert });

    expect(notifications.emitToOrganization).toHaveBeenCalledWith(organization_id, AlertSocketEvents.Created, alert);
  });

  it('pushes resolved alerts to the organization', () => {
    controller.handleAlertResolved({ organization_id, alert: { ...alert, estado: 'RESUELTA' } });

    expect(notifications.emitToOrganization).toHaveBeenCalledWith(
      organization_id,
      AlertSocketEvents.Resolved,
      expect.objectContaining({ estado: 'RESUELTA' }),
    );
  });
});
