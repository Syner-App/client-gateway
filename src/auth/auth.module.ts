import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.ts';
import { AuthGuard } from './guards/auth.guard.ts';
import { RolesGuard } from './guards/roles.guard.ts';
import { GrpcModule } from '../transport/grpc.module.ts';

@Module({
  imports: [GrpcModule],
  controllers: [AuthController],
  providers: [AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard],
})
export class AuthModule {}
