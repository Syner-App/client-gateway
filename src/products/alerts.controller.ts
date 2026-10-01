import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { PRODUCTS_SERVICE } from '../config/index.ts';
import {
  PRODUCTS_SERVICE_NAME,
  type ProductsServiceClient,
} from '../generated/proto/products.ts';
import { FindAlertsDto } from './dtos/find-alerts.dto.ts';
import { Auth, OrganizationId } from '../auth/decorators/index.ts';

// Alerts live in products-ms: STOCK_BAJO alerts are generated on every stock change
@Auth()
@ApiTags('Alerts')
@Controller('alerts')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AlertsController implements OnModuleInit {
  private productsService: ProductsServiceClient;

  constructor(@Inject(PRODUCTS_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.productsService =
      this.client.getService<ProductsServiceClient>(PRODUCTS_SERVICE_NAME);
  }

  @Get()
  findAllAlerts(@Query() findAlertsDto: FindAlertsDto, @OrganizationId() organization_id: string) {
    return this.productsService.findAlerts({ ...findAlertsDto, organization_id });
  }
}
