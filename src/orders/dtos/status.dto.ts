import { IsIn } from 'class-validator';
import { OrderStatus } from '../../generated/proto/orders.ts';
import { ORDER_STATUS_MESSAGE, OrderStatusList } from '../enum/order.enum.ts';

export class StatusDto {

    @IsIn(OrderStatusList, { message: ORDER_STATUS_MESSAGE })
    public status: OrderStatus;
}
