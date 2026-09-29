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
  ORDERS_SERVICE_NAME,
  type OrdersServiceClient,
} from '../generated/proto/orders.ts';
import { CreateOrderDto } from './dtos/create-order.dto.ts';
import { OrderPaginationDto } from './dtos/order-pagination.dto.ts';
import { StatusDto } from './dtos/status.dto.ts';

@Controller('orders')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class OrdersController implements OnModuleInit {
  private ordersService: OrdersServiceClient;

  constructor(@Inject(ORDERS_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.ordersService =
      this.client.getService<OrdersServiceClient>(ORDERS_SERVICE_NAME);
  }

  // The order saga validates the products asynchronously: the order is returned
  // AWAITING_VALIDATION and moves to PENDING or REJECTED shortly after
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  createOrder(@Body() payload: CreateOrderDto) {
    return this.ordersService.create(payload);
  }

  @Get()
  findAllOrders(@Query() orderPaginationDto: OrderPaginationDto) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @Get(':id')
  findOneOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne({ id });
  }

  @Patch(':id')
  changeOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { status }: StatusDto,
  ) {
    return this.ordersService.changeOrderStatus({ id, status });
  }
}
