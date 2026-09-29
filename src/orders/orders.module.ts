import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrdersController } from './orders.controller.js';
import { envs, ORDERS_SERVICE } from '../config/index.ts';
import { ORDERS_PACKAGE_NAME } from '../generated/proto/orders.ts';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDERS_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: ORDERS_PACKAGE_NAME,
          protoPath: join(import.meta.dirname, '../proto/orders.proto'),
          url: `${envs.ordersMicroserviceHost}:${envs.ordersMicroservicePort}`,
          loader: { enums: String },
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [],
})
export class OrdersModule {}
