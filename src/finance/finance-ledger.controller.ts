import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { FINANCE_SERVICE } from '../config/index.ts';
import { FINANCE_SERVICE_NAME, type FinanceServiceClient } from '../generated/proto/finance.ts';
import { Auth, OrganizationId, Roles } from '../auth/decorators/index.ts';
import { MANAGER_ROLES, OWNER_ROLES } from '../auth/roles.ts';
import {
  FindMovementsDto,
  PayExpenseDto,
  RegisterContributionDto,
  RegisterExpenseDto,
  RegisterWithdrawalDto,
  ReopenPeriodDto,
  TransferReserveDto,
} from './dtos/index.ts';

// Money in and out of the business. owner/admin record and pay expenses; only the owner moves
// money between the business and its owners (contributions, withdrawals, reserve) and
// closes periods. Every call is scoped to the organization of the token (@OrganizationId)
@Auth()
@Controller('finance')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class FinanceLedgerController implements OnModuleInit {
  private financeService: FinanceServiceClient;

  constructor(@Inject(FINANCE_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.financeService = this.client.getService<FinanceServiceClient>(FINANCE_SERVICE_NAME);
  }

  @Roles(...MANAGER_ROLES)
  @Post('expenses')
  registerExpense(@Body() payload: RegisterExpenseDto, @OrganizationId() organization_id: string) {
    return this.financeService.registerExpense({ ...payload, pagado: payload.pagado ?? false, organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Patch('expenses/:id/pay')
  payExpense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: PayExpenseDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.financeService.payExpense({ ...payload, id, organization_id });
  }

  // Filters: periodo, categoria, estado
  @Roles(...MANAGER_ROLES)
  @Get('movements')
  findMovements(@Query() query: FindMovementsDto, @OrganizationId() organization_id: string) {
    return this.financeService.findMovements({ ...query, organization_id });
  }

  @Roles(...OWNER_ROLES)
  @Post('contributions')
  registerContribution(@Body() payload: RegisterContributionDto, @OrganizationId() organization_id: string) {
    return this.financeService.registerContribution({ ...payload, organization_id });
  }

  @Roles(...OWNER_ROLES)
  @Post('reserve/transfers')
  transferReserve(
    @Body() { monto, cuenta, hacia_reserva = true, fecha }: TransferReserveDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.financeService.transferReserve({ monto, cuenta, hacia_reserva, fecha, organization_id });
  }

  // Accepted up to the distributable profit of the waterfall (GET /finance/waterfall)
  @Roles(...OWNER_ROLES)
  @Post('withdrawals')
  registerWithdrawal(@Body() payload: RegisterWithdrawalDto, @OrganizationId() organization_id: string) {
    return this.financeService.registerWithdrawal({ ...payload, forzar: payload.forzar ?? false, organization_id });
  }

  @Roles(...OWNER_ROLES)
  @Post('periods/:periodo/close')
  closePeriod(@Param('periodo') periodo: string, @OrganizationId() organization_id: string) {
    return this.financeService.closePeriod({ periodo, organization_id });
  }

  @Roles(...OWNER_ROLES)
  @Post('periods/:periodo/reopen')
  reopenPeriod(
    @Param('periodo') periodo: string,
    @Body() { motivo }: ReopenPeriodDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.financeService.reopenPeriod({ periodo, motivo, organization_id });
  }
}
