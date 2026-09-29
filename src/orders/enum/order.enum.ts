import { OrderStatus } from '../../generated/proto/orders.ts';

// UNRECOGNIZED is a ts-proto artifact, not a valid value to send
export const OrderStatusList = Object.values(OrderStatus).filter(
  (status) => status !== OrderStatus.UNRECOGNIZED,
);

export const ORDER_STATUS_MESSAGE = `Possible status values are ${OrderStatusList.join(', ')}`;
