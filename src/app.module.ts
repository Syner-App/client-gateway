import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module.js';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module.ts';
import { AuthModule } from './auth/auth.module.ts';
import { OrganizationsModule } from './organizations/organizations.module.ts';
import { FinanceModule } from './finance/finance.module.ts';


@Module({
  imports: [ProductsModule, PurchaseOrdersModule, AuthModule, OrganizationsModule, FinanceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
