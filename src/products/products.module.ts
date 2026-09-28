import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ProductsController } from './products.controller.js';
import { envs, PRODUCTS_SERVICE } from '../config/index.ts';
import { PRODUCTS_PACKAGE_NAME } from '../generated/proto/products.ts';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PRODUCTS_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: PRODUCTS_PACKAGE_NAME,
          protoPath: join(import.meta.dirname, '../proto/products.proto'),
          url: `${envs.productsMicroserviceHost}:${envs.productsMicroservicePort}`,
        },
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [],
})
export class ProductsModule {}
