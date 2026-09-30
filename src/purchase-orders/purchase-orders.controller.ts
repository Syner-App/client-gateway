import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { ORDERS_SERVICE } from '../config/index.ts';
import {
  PURCHASE_ORDERS_SERVICE_NAME,
  type PurchaseOrdersServiceClient,
} from '../generated/proto/orders.ts';
import {
  CreatePurchaseOrderDto,
  PurchaseOrderPaginationDto,
  UpdateStatusPurchaseDto,
} from './dtos/index.ts';
import { Auth, Roles } from '../auth/decorators/index.ts';
import { MANAGER_ROLES } from '../auth/roles.ts';

// Any authenticated user can read; only owner/admin create orders and change their status
@Auth()
@Controller('purchase-orders')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PurchaseOrdersController implements OnModuleInit {
  private purchaseOrdersService: PurchaseOrdersServiceClient;

  constructor(@Inject(ORDERS_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.purchaseOrdersService =
      this.client.getService<PurchaseOrdersServiceClient>(PURCHASE_ORDERS_SERVICE_NAME);
  }

  // The purchase order saga validates the product asynchronously: the order is
  // returned EN_VALIDACION and moves to PENDIENTE or RECHAZADA shortly after
  @Roles(...MANAGER_ROLES)
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  createPurchaseOrder(@Body() payload: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(payload);
  }

  @Get()
  findAllPurchaseOrders(@Query() purchaseOrderPaginationDto: PurchaseOrderPaginationDto) {
    return this.purchaseOrdersService.findAll(purchaseOrderPaginationDto);
  }

  @Get(':id')
  findOnePurchaseOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrdersService.findOne({ id });
  }

  // PENDIENTE -> APROBADA | RECHAZADA (motivo required), APROBADA -> RECIBIDA
  @Roles(...MANAGER_ROLES)
  @Patch('update-status/:id')
  updateStatusPurchase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { estado, motivo }: UpdateStatusPurchaseDto,
  ) {
    return this.purchaseOrdersService.updateStatus({ id, estado, motivo });
  }
}
