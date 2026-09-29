import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto.ts';
import { enumMessage, enumValues } from '../../common/index.ts';
import { StatusPurchaseOrder } from '../../generated/proto/orders.ts';

const PURCHASE_ORDER_STATUSES = enumValues(StatusPurchaseOrder);

export class PurchaseOrderPaginationDto extends PaginationDto {
  @IsIn(PURCHASE_ORDER_STATUSES, { message: enumMessage('estado', PURCHASE_ORDER_STATUSES) })
  @IsOptional()
  public estado?: StatusPurchaseOrder;
}
