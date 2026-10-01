import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Patch,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { FINANCE_SERVICE } from '../config/index.ts';
import { FINANCE_SERVICE_NAME, type FinanceServiceClient } from '../generated/proto/finance.ts';
import { Auth, OrganizationId, Roles } from '../auth/decorators/index.ts';
import { MANAGER_ROLES, OWNER_ROLES } from '../auth/roles.ts';
import { PeriodQueryDto, ScenariosQueryDto, SetAssumptionsDto, UpdatePolicyDto } from './dtos/index.ts';

// Planning and reports: break-even assumptions, financial policy, income statement,
// waterfall, scenarios and the dashboard that answers the owner's questions. owner/admin read
// them; only the owner changes the policy
@Auth(...MANAGER_ROLES)
@ApiTags('Finance: reports')
@Controller('finance')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class FinanceReportsController implements OnModuleInit {
  private financeService: FinanceServiceClient;

  constructor(@Inject(FINANCE_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.financeService = this.client.getService<FinanceServiceClient>(FINANCE_SERVICE_NAME);
  }

  @Get('assumptions')
  getAssumptions(@OrganizationId() organization_id: string) {
    return this.financeService.getAssumptions({ organization_id });
  }

  @Put('assumptions')
  setAssumptions(@Body() payload: SetAssumptionsDto, @OrganizationId() organization_id: string) {
    return this.financeService.setAssumptions({ ...payload, organization_id });
  }

  @Get('policy')
  getPolicy(@OrganizationId() organization_id: string) {
    return this.financeService.getPolicy({ organization_id });
  }

  @Roles(...OWNER_ROLES)
  @Patch('policy')
  updatePolicy(
    @Body() { dias_cobertura, meses_reserva, porcentaje_retiro, niveles_escenario = [], categorias_variables = [] }: UpdatePolicyDto,
    @OrganizationId() organization_id: string,
  ) {
    // Empty lists keep the current values
    return this.financeService.updatePolicy({
      dias_cobertura,
      meses_reserva,
      porcentaje_retiro,
      niveles_escenario,
      categorias_variables,
      organization_id,
    });
  }

  @Get('income-statement')
  getIncomeStatement(@Query() { periodo }: PeriodQueryDto, @OrganizationId() organization_id: string) {
    return this.financeService.getIncomeStatement({ periodo, organization_id });
  }

  @Get('waterfall')
  getWaterfall(@OrganizationId() organization_id: string) {
    return this.financeService.getWaterfall({ organization_id });
  }

  @Get('break-even')
  getBreakEven(@OrganizationId() organization_id: string) {
    return this.financeService.getBreakEven({ organization_id });
  }

  @Get('scenarios')
  getScenarios(@Query() { niveles }: ScenariosQueryDto, @OrganizationId() organization_id: string) {
    return this.financeService.getScenarios({ niveles: niveles ?? [], organization_id });
  }

  @Get('dashboard')
  getDashboard(@OrganizationId() organization_id: string) {
    return this.financeService.getDashboard({ organization_id });
  }
}
