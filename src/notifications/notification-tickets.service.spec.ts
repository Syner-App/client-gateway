import { NotificationTicketsService, TICKET_TTL_MS } from './notification-tickets.service.ts';

const owner = { user_id: 'user-1', organization_id: '6abd26a42d059ac027376ca1' };

describe('NotificationTicketsService', () => {
  let service: NotificationTicketsService;

  beforeEach(() => {
    service = new NotificationTicketsService();
  });
  afterEach(() => vi.useRealTimers());

  it('returns the owner of a fresh ticket', () => {
    const ticket = service.issue(owner);

    expect(service.consume(ticket)).toEqual(owner);
  });

  it('accepts a ticket only once', () => {
    const ticket = service.issue(owner);
    service.consume(ticket);

    expect(service.consume(ticket)).toBeUndefined();
  });

  it('rejects an expired ticket', () => {
    vi.useFakeTimers();
    const ticket = service.issue(owner);
    vi.advanceTimersByTime(TICKET_TTL_MS);

    expect(service.consume(ticket)).toBeUndefined();
  });

  it('rejects unknown or non-string tickets', () => {
    expect(service.consume('nope')).toBeUndefined();
    expect(service.consume(undefined)).toBeUndefined();
    expect(service.consume({ ticket: 'x' })).toBeUndefined();
  });
});
