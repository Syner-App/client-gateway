import { Module } from '@nestjs/common';
import { FinanceLedgerController } from './finance-ledger.controller.ts';
import { FinanceOperationsController } from './finance-operations.controller.ts';
import { FinanceReportsController } from './finance-reports.controller.ts';
import { GrpcModule } from '../transport/grpc.module.ts';
import { AuthModule } from '../auth/auth.module.ts';

@Module({
  imports: [GrpcModule, AuthModule],
  controllers: [FinanceLedgerController, FinanceOperationsController, FinanceReportsController],
  providers: [],
})
export class FinanceModule {}
