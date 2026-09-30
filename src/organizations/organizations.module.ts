import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller.ts';
import { GrpcModule } from '../transport/grpc.module.ts';
import { AuthModule } from '../auth/auth.module.ts';

@Module({
  imports: [GrpcModule, AuthModule],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
