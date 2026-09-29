import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto.ts';
import { OrderStatus } from '../../generated/proto/orders.ts';
import { ORDER_STATUS_MESSAGE, OrderStatusList } from '../enum/order.enum.ts';

export class OrderPaginationDto extends PaginationDto {

  @IsIn(OrderStatusList, { message: ORDER_STATUS_MESSAGE })
  @IsOptional()
  status?: OrderStatus;

}
