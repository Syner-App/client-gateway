import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { AlertsController } from './alerts.controller.ts';
import { GrpcModule } from '../transport/grpc.module.ts';
import { AuthModule } from '../auth/auth.module.ts';

@Module({
  imports: [GrpcModule, AuthModule],
  controllers: [ProductsController, AlertsController],
  providers: [],
})
export class ProductsModule {}
