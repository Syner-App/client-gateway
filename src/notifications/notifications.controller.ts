import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { User as UserResponse } from '../generated/proto/auth.ts';
import { Auth, OrganizationId, User } from '../auth/decorators/index.ts';
import { NotificationTicketsService, TICKET_TTL_MS } from './notification-tickets.service.ts';

@Auth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly tickets: NotificationTicketsService) {}

  /**
   * Single-use ticket (valid for 30 seconds) to open the `/notifications` Socket.IO
   * namespace with `auth: { ticket }`. The socket joins the token's organization
   */
  @Post('ticket')
  @HttpCode(HttpStatus.OK)
  issueTicket(@User() user: UserResponse, @OrganizationId() organization_id: string) {
    const ticket = this.tickets.issue({ user_id: user.id, organization_id });
    return { ticket, expiresIn: TICKET_TTL_MS / 1000 };
  }
}
