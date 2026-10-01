import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.ts';
import { GrpcModule } from '../transport/grpc.module.ts';
import { AlertEventsController } from './alert-events.controller.ts';
import { NotificationTicketsService } from './notification-tickets.service.ts';
import { NotificationsController } from './notifications.controller.ts';
import { NotificationsGateway } from './notifications.gateway.ts';

@Module({
  imports: [GrpcModule, AuthModule],
  controllers: [NotificationsController, AlertEventsController],
  providers: [NotificationsGateway, NotificationTicketsService],
})
export class NotificationsModule {}
