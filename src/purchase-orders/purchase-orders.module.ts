import { Module } from '@nestjs/common';
import { PurchaseOrdersController } from './purchase-orders.controller.ts';
import { GrpcModule } from '../transport/grpc.module.ts';

@Module({
  imports: [GrpcModule],
  controllers: [PurchaseOrdersController],
  providers: [],
})
export class PurchaseOrdersModule {}
