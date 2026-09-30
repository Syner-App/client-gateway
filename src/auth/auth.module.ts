import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.ts';
import { AuthGuard } from './guards/auth.guard.ts';
import { GrpcModule } from '../transport/grpc.module.ts';

@Module({
  imports: [GrpcModule],
  controllers: [AuthController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
