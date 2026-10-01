import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_SERVICE, FINANCE_SERVICE, ORDERS_SERVICE, PRODUCTS_SERVICE } from '../config/services.ts';
import { ORDERS_PACKAGE_NAME } from '../generated/proto/orders.ts';
import { envs } from '../config/envs.ts';
import { PRODUCTS_PACKAGE_NAME } from '../generated/proto/products.ts';
import { AUTH_PACKAGE_NAME } from '../generated/proto/auth.ts';
import { FINANCE_PACKAGE_NAME } from '../generated/proto/finance.ts';

// snake_case fields and string enums, like the microservices. defaults and arrays keep
// zero values (0, false, the first enum value, empty lists) in the responses instead of
// dropping them; proto3 optional fields stay absent when unset
const loader = { keepCase: true, enums: String, defaults: true, arrays: true };

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
    {
        name: FINANCE_SERVICE,
        transport: Transport.GRPC,
        options: {
            package: FINANCE_PACKAGE_NAME,
            protoPath: join(import.meta.dirname, '../proto/finance.proto'),
            url: `${envs.financeMicroserviceHost}:${envs.financeMicroservicePort}`,
            // int64 amounts as numbers
            loader: { ...loader, longs: Number },
        },
    },
]);

@Module({
    imports: [grpcClients],
    exports: [grpcClients],
})
export class GrpcModule { }
