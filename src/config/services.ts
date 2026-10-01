export const PRODUCTS_SERVICE = 'PRODUCTS_SERVICE';
export const ORDERS_SERVICE = 'ORDERS_SERVICE';
export const AUTH_SERVICE = 'AUTH_SERVICE';
export const FINANCE_SERVICE = 'FINANCE_SERVICE';

// Topic exchange shared by every Syner service. It and the notifications queue are declared
// in syner/rabbitmq/definitions.json; queue arguments here must match that file
export const SYNER_EXCHANGE = 'syner.events';
export const NOTIFICATIONS_QUEUE = 'gateway.notifications';
export const NOTIFICATIONS_QUEUE_TTL_MS = 60000;
