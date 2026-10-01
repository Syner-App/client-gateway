import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AlertEventPayload, AlertEvents } from '../common/index.ts';
import { NotificationsGateway } from './notifications.gateway.ts';

// Socket events seen by syner-app
export const AlertSocketEvents = {
  Created: 'alert:created',
  Resolved: 'alert:resolved',
} as const;

// Alert changes published by products-ms, consumed from gateway.notifications and pushed
// to the sockets of the alert's organization. noAck queue: an invalid or failed
// notification is dropped (the alert is still listed by GET /api/alerts)
@Controller()
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AlertEventsController {
  constructor(private readonly notifications: NotificationsGateway) {}

  @EventPattern(AlertEvents.Created)
  handleAlertCreated(@Payload() { organization_id, alert }: AlertEventPayload) {
    this.notifications.emitToOrganization(organization_id, AlertSocketEvents.Created, alert);
  }

  @EventPattern(AlertEvents.Resolved)
  handleAlertResolved(@Payload() { organization_id, alert }: AlertEventPayload) {
    this.notifications.emitToOrganization(organization_id, AlertSocketEvents.Resolved, alert);
  }
}
