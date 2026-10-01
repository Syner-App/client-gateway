import { NotificationTicketsService } from './notification-tickets.service.ts';
import { NotificationsGateway } from './notifications.gateway.ts';

const organization_id = '6abd26a42d059ac027376ca1';

const socket = (auth: Record<string, unknown>) => ({
  id: 'socket-1',
  handshake: { auth },
  data: {} as Record<string, unknown>,
  emit: vi.fn(),
  join: vi.fn(),
  disconnect: vi.fn(),
});

describe('NotificationsGateway', () => {
  let tickets: NotificationTicketsService;
  let gateway: NotificationsGateway;

  beforeEach(() => {
    tickets = new NotificationTicketsService();
    gateway = new NotificationsGateway(tickets);
  });

  it('joins the room of the ticket organization', async () => {
    const client = socket({ ticket: tickets.issue({ user_id: 'user-1', organization_id }) });

    await gateway.handleConnection(client as never);

    expect(client.join).toHaveBeenCalledWith(`org:${organization_id}`);
    expect(client.data.user_id).toBe('user-1');
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('disconnects a socket without a valid ticket', async () => {
    const client = socket({ ticket: 'forged' });

    await gateway.handleConnection(client as never);

    expect(client.join).not.toHaveBeenCalled();
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('emits only to the organization room', () => {
    const emit = vi.fn();
    const to = vi.fn(() => ({ emit }));
    Object.assign(gateway, { server: { to } });

    gateway.emitToOrganization(organization_id, 'alert:created', { id: 'alert-1' });

    expect(to).toHaveBeenCalledWith(`org:${organization_id}`);
    expect(emit).toHaveBeenCalledWith('alert:created', { id: 'alert-1' });
  });
});
