import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

// Stock alert notifications. Keep in sync with products-ms/src/common/events/alert.events.ts.
// products-ms publishes them to syner.events after the alert change is committed
export const AlertEvents = {
  Created: 'alert.created',
  Resolved: 'alert.resolved',
} as const;

export class AlertNotification {
  @IsUUID()
  id: string;

  @IsMongoId()
  organization_id: string;

  @IsInt()
  product_id: number;

  @IsString()
  tipo: string;

  @IsString()
  estado: string;

  @IsString()
  descripcion: string;

  @IsString()
  createdAt: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;
}

export class AlertEventPayload {
  @IsMongoId()
  organization_id: string;

  @ValidateNested()
  @Type(() => AlertNotification)
  alert: AlertNotification;
}
