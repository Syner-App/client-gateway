import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller.ts';
import { CurrentOrganizationController } from './current-organization.controller.ts';
import { GrpcModule } from '../transport/grpc.module.ts';
import { AuthModule } from '../auth/auth.module.ts';

@Module({
  imports: [GrpcModule, AuthModule],
  controllers: [OrganizationsController, CurrentOrganizationController],
})
export class OrganizationsModule {}
