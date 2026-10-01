import { IsIn, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { enumMessage } from '../../common/index.ts';
import { StatusPurchaseOrder } from '../../generated/proto/orders.ts';

// EN_VALIDACION and PENDIENTE are set by the purchase order saga only
export const UPDATABLE_PURCHASE_ORDER_STATUSES = [
  StatusPurchaseOrder.APROBADA,
  StatusPurchaseOrder.RECHAZADA,
  StatusPurchaseOrder.RECIBIDA,
];

export class UpdateStatusPurchaseDto {
  @IsIn(UPDATABLE_PURCHASE_ORDER_STATUSES, {
    message: enumMessage('estado', UPDATABLE_PURCHASE_ORDER_STATUSES),
  })
  public estado: StatusPurchaseOrder;

  /** Required when rejecting, optional otherwise */
  @ValidateIf((dto: UpdateStatusPurchaseDto) => dto.estado === StatusPurchaseOrder.RECHAZADA || dto.motivo !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'motivo is required when estado is RECHAZADA' })
  public motivo?: string;
}
