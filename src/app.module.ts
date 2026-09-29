import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module.js';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module.ts';


@Module({
  imports: [ProductsModule, PurchaseOrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
