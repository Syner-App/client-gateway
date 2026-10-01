import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
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
import {
  CreateCreditDto,
  CreateRecipeDto,
  FindPayablesDto,
  FindSalesDto,
  PayInstallmentDto,
  PayPayableDto,
  PrepayCreditDto,
  RegisterSaleDto,
  UpdateRecipeDto,
  UpsertSupplyDto,
} from './dtos/index.ts';

// Day-to-day operation: supplies (products-ms products with a cost), recipes, sales,
// payables of received purchase orders and the credit. Any member registers sales and reads
// the recipes; owner/admin manage the rest; only the owner takes on credit or prepays it
@Auth()
@ApiTags('Finance: operations')
@Controller('finance')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class FinanceOperationsController implements OnModuleInit {
  private financeService: FinanceServiceClient;

  constructor(@Inject(FINANCE_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.financeService = this.client.getService<FinanceServiceClient>(FINANCE_SERVICE_NAME);
  }

  @Roles(...MANAGER_ROLES)
  @Get('supplies')
  findSupplies(@OrganizationId() organization_id: string) {
    return this.financeService.findSupplies({ organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Put('supplies/:productoId')
  upsertSupply(
    @Param('productoId', ParseIntPipe) producto_id: number,
    @Body() payload: UpsertSupplyDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.financeService.upsertSupply({ ...payload, producto_id, organization_id });
  }

  @Get('recipes')
  findRecipes(@OrganizationId() organization_id: string) {
    return this.financeService.findRecipes({ organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Post('recipes')
  createRecipe(@Body() payload: CreateRecipeDto, @OrganizationId() organization_id: string) {
    return this.financeService.createRecipe({ ...payload, organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Patch('recipes/:id')
  updateRecipe(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateRecipeDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.financeService.updateRecipe({ ...payload, items: payload.items ?? [], id, organization_id });
  }

  /** Discounts the supplies of the recipes from the products-ms stock (estado_stock) */
  @Post('sales')
  registerSale(@Body() payload: RegisterSaleDto, @OrganizationId() organization_id: string) {
    return this.financeService.registerSale({ ...payload, organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Get('sales')
  findSales(@Query() query: FindSalesDto, @OrganizationId() organization_id: string) {
    return this.financeService.findSales({ ...query, organization_id });
  }

  /** After fixing the stock in products-ms, sends the discount of a rejected sale again */
  @Roles(...MANAGER_ROLES)
  @Post('sales/:id/retry-stock')
  retrySaleStock(@Param('id', ParseUUIDPipe) id: string, @OrganizationId() organization_id: string) {
    return this.financeService.retrySaleStock({ id, organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Get('payables')
  findPayables(@Query() query: FindPayablesDto, @OrganizationId() organization_id: string) {
    return this.financeService.findPayables({ ...query, organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Patch('payables/:id/pay')
  payPayable(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: PayPayableDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.financeService.payPayable({ ...payload, id, organization_id });
  }

  @Roles(...OWNER_ROLES)
  @Post('credits')
  createCredit(@Body() payload: CreateCreditDto, @OrganizationId() organization_id: string) {
    return this.financeService.createCredit({ ...payload, organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Get('credits')
  findCredits(@OrganizationId() organization_id: string) {
    return this.financeService.findCredits({ organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Post('credits/:id/installments')
  payInstallment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: PayInstallmentDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.financeService.payInstallment({ ...payload, id, organization_id });
  }

  /** Only with the working capital covered and the reserve complete (GET /finance/waterfall) */
  @Roles(...OWNER_ROLES)
  @Post('credits/:id/prepayments')
  prepayCredit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: PrepayCreditDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.financeService.prepayCredit({ ...payload, id, organization_id });
  }
}
