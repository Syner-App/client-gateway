import { Logger } from '@nestjs/common';
import { type OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { envs } from '../config/index.ts';
import { NotificationTicketsService } from './notification-tickets.service.ts';

export const NOTIFICATIONS_NAMESPACE = '/notifications';

export const organizationRoom = (organization_id: string) => `org:${organization_id}`;

// Socket.IO namespace for real-time notifications. The client authenticates with a ticket
// from POST /api/notifications/ticket in the handshake (`auth: { ticket }`) and joins the
// room of the organization the ticket was issued for
@WebSocketGateway({
  namespace: NOTIFICATIONS_NAMESPACE,
  cors: { origin: envs.corsOrigins, credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private readonly server: Namespace;

  constructor(private readonly tickets: NotificationTicketsService) {}

  async handleConnection(client: Socket) {
    const owner = this.tickets.consume(client.handshake.auth?.ticket);
    if (!owner) {
      client.emit('unauthorized', { message: 'Invalid or expired ticket' });
      client.disconnect(true);
      return;
    }

    client.data.user_id = owner.user_id;
    await client.join(organizationRoom(owner.organization_id));
    this.logger.debug(`Socket ${client.id} joined ${organizationRoom(owner.organization_id)}`);
  }

  emitToOrganization(organization_id: string, event: string, data: unknown) {
    this.server.to(organizationRoom(organization_id)).emit(event, data);
  }
}
