import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ORDERS_SERVICE, PRODUCTS_SERVICE } from '../config/services.ts';
import { ORDERS_PACKAGE_NAME } from '../generated/proto/orders.ts';
import { envs } from '../config/envs.ts';
import { PRODUCTS_PACKAGE_NAME } from '../generated/proto/products.ts';

const grpcClients = ClientsModule.register([
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
    {
        name: PRODUCTS_SERVICE,
        transport: Transport.GRPC,
        options: {
            package: PRODUCTS_PACKAGE_NAME,
            protoPath: join(import.meta.dirname, '../proto/products.proto'),
            url: `${envs.productsMicroserviceHost}:${envs.productsMicroservicePort}`,
        },
    },
]);

@Module({
    imports: [grpcClients],
    exports: [grpcClients],
})
export class GrpcModule { }
