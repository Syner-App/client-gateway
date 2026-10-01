import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export const TICKET_TTL_MS = 30_000;

export interface TicketOwner {
  user_id: string;
  organization_id: string;
}

interface StoredTicket extends TicketOwner {
  expiresAt: number;
}

// Single-use tickets that authenticate the notifications socket. The browser never sees the
// session JWT (httpOnly cookie in syner-app), so the BFF trades it for a ticket over HTTP.
// Kept in memory: valid only with a single gateway instance
@Injectable()
export class NotificationTicketsService {
  private readonly tickets = new Map<string, StoredTicket>();

  issue(owner: TicketOwner): string {
    this.purgeExpired();
    const ticket = randomUUID();
    this.tickets.set(ticket, { ...owner, expiresAt: Date.now() + TICKET_TTL_MS });
    return ticket;
  }

  // Returns the owner and invalidates the ticket; undefined when unknown, used or expired
  consume(ticket: unknown): TicketOwner | undefined {
    if (typeof ticket !== 'string') return undefined;
    const stored = this.tickets.get(ticket);
    if (!stored) return undefined;

    this.tickets.delete(ticket);
    if (stored.expiresAt <= Date.now()) return undefined;
    return { user_id: stored.user_id, organization_id: stored.organization_id };
  }

  private purgeExpired() {
    const now = Date.now();
    for (const [ticket, { expiresAt }] of this.tickets) {
      if (expiresAt <= now) this.tickets.delete(ticket);
    }
  }
}
