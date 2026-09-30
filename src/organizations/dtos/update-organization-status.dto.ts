import { IsIn } from 'class-validator';
import type { OrganizationStatus } from '../../generated/proto/auth.ts';
import { enumMessage } from '../../common/index.ts';
import { ORGANIZATION_STATUSES } from '../../auth/roles.ts';

export class UpdateOrganizationStatusDto {
  // SUSPENDED rejects every token of the organization on the next request
  @IsIn(ORGANIZATION_STATUSES, { message: enumMessage('status', ORGANIZATION_STATUSES) })
  public status: OrganizationStatus;
}
