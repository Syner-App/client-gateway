import { Account, MovementCategory, StatusMovement, StatusPayable, StatusStockDeduction } from '../../generated/proto/finance.ts';
import { enumValues } from '../../common/index.ts';

// Accounts that hold operating cash (RESERVA is set apart, it moves with the transfers)
export const CASH_ACCOUNTS = [Account.CAJA, Account.BANCO];

// Categories of RegisterExpense; withdrawals, installments and transfers have their own routes
export const OPERATING_EXPENSES = [
  MovementCategory.MATERIA_PRIMA,
  MovementCategory.EMPAQUES,
  MovementCategory.TRANSPORTE,
  MovementCategory.SERVICIOS,
  MovementCategory.ARRIENDO,
  MovementCategory.SALARIOS,
  MovementCategory.PUBLICIDAD,
  MovementCategory.OTROS_OPERATIVOS,
];

export const SUPPLY_CATEGORIES = [MovementCategory.MATERIA_PRIMA, MovementCategory.EMPAQUES];

export const MOVEMENT_CATEGORIES = enumValues(MovementCategory);
export const MOVEMENT_STATUSES = enumValues(StatusMovement);
export const STOCK_DEDUCTION_STATUSES = enumValues(StatusStockDeduction);
export const PAYABLE_STATUSES = enumValues(StatusPayable);

export const DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;
export const DATE_MESSAGE = '$property must be a date (YYYY-MM-DD)';
export const PERIOD_MESSAGE = '$property must be a period (YYYY-MM)';
