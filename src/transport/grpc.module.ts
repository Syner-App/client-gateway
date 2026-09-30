import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_SERVICE, ORDERS_SERVICE, PRODUCTS_SERVICE } from '../config/services.ts';
import { ORDERS_PACKAGE_NAME } from '../generated/proto/orders.ts';
import { envs } from '../config/envs.ts';
import { PRODUCTS_PACKAGE_NAME } from '../generated/proto/products.ts';
import { AUTH_PACKAGE_NAME } from '../generated/proto/auth.ts';

// snake_case fields and string enums, like the microservices
const loader = { keepCase: true, enums: String };

const grpcClients = ClientsModule.register([
    {
        name: ORDERS_SERVICE,
        transport: Transport.GRPC,
        options: {
            package: ORDERS_PACKAGE_NAME,
            protoPath: join(import.meta.dirname, '../proto/orders.proto'),
            url: `${envs.ordersMicroserviceHost}:${envs.ordersMicroservicePort}`,
            loader,
        },
    },
    {
        name: PRODUCTS_SERVICE,
        transport: Transport.GRPC,
        options: {
            package: PRODUCTS_PACKAGE_NAME,
            protoPath: join(import.meta.dirname, '../proto/products.proto'),
            url: `${envs.productsMicroserviceHost}:${envs.productsMicroservicePort}`,
            loader,
        },
    },
    {
        name: AUTH_SERVICE,
        transport: Transport.GRPC,
        options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(import.meta.dirname, '../proto/auth.proto'),
            url: `${envs.authMicroserviceHost}:${envs.authMicroservicePort}`,
            loader,
        },
    },
]);

@Module({
    imports: [grpcClients],
    exports: [grpcClients],
})
export class GrpcModule { }
