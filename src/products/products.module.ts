import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { GrpcModule } from '../transport/grpc.module.ts';

@Module({
  imports: [GrpcModule],
  controllers: [ProductsController],
  providers: [],
})
export class ProductsModule {}
