import { Module } from '@nestjs/common';
import { PurchaseOrdersController } from './purchase-orders.controller.ts';
import { GrpcModule } from '../transport/grpc.module.ts';
import { AuthModule } from '../auth/auth.module.ts';

@Module({
  imports: [GrpcModule, AuthModule],
  controllers: [PurchaseOrdersController],
  providers: [],
})
export class PurchaseOrdersModule {}
