import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { GrpcModule } from '../transport/grpc.module.ts';

@Module({
  imports: [GrpcModule],
  controllers: [OrdersController],
  providers: [],
})
export class OrdersModule {}
