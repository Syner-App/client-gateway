import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { Account, MovementCategory, StatusMovement } from '../../generated/proto/finance.ts';
import { PaginationDto } from '../../common/dtos/pagination.dto.ts';
import { enumMessage } from '../../common/index.ts';
import {
  CASH_ACCOUNTS,
  DATE,
  DATE_MESSAGE,
  MOVEMENT_CATEGORIES,
  MOVEMENT_STATUSES,
  OPERATING_EXPENSES,
  PERIOD,
  PERIOD_MESSAGE,
} from './finance-enums.ts';

export class RegisterExpenseDto {
  @IsIn(OPERATING_EXPENSES, { message: enumMessage('categoria', OPERATING_EXPENSES) })
  public categoria: MovementCategory;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  public monto: number;

  // Accrual date, default today
  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public fecha?: string;

  // false (default): accrued now, paid later with PATCH /finance/expenses/:id/pay
  @IsBoolean()
  @IsOptional()
  public pagado?: boolean;

  @ValidateIf((dto: RegisterExpenseDto) => dto.pagado === true)
  @IsIn(CASH_ACCOUNTS, { message: enumMessage('cuenta', CASH_ACCOUNTS) })
  public cuenta?: Account;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  public descripcion?: string;
}

export class PayExpenseDto {
  @IsIn(CASH_ACCOUNTS, { message: enumMessage('cuenta', CASH_ACCOUNTS) })
  public cuenta: Account;

  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public fecha?: string;
}

export class RegisterContributionDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  public monto: number;

  @IsIn(CASH_ACCOUNTS, { message: enumMessage('cuenta', CASH_ACCOUNTS) })
  public cuenta: Account;

  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public fecha?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  public descripcion?: string;
}

export class TransferReserveDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  public monto: number;

  // CAJA or BANCO: origin (or destination, when leaving the reserve)
  @IsIn(CASH_ACCOUNTS, { message: enumMessage('cuenta', CASH_ACCOUNTS) })
  public cuenta: Account;

  // true (default): into the reserve; false: back to cuenta
  @IsBoolean()
  @IsOptional()
  public hacia_reserva?: boolean;

  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public fecha?: string;
}

export class RegisterWithdrawalDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  public monto: number;

  @IsIn(CASH_ACCOUNTS, { message: enumMessage('cuenta', CASH_ACCOUNTS) })
  public cuenta: Account;

  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public fecha?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  public descripcion?: string;

  // Withdraw above the distributable profit: flagged as descapitalizacion, requires motivo
  @IsBoolean()
  @IsOptional()
  public forzar?: boolean;

  @ValidateIf((dto: RegisterWithdrawalDto) => dto.forzar === true)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public motivo?: string;
}

export class FindMovementsDto extends PaginationDto {
  @Matches(PERIOD, { message: PERIOD_MESSAGE })
  @IsOptional()
  public periodo?: string;

  @IsIn(MOVEMENT_CATEGORIES, { message: enumMessage('categoria', MOVEMENT_CATEGORIES) })
  @IsOptional()
  public categoria?: MovementCategory;

  @IsIn(MOVEMENT_STATUSES, { message: enumMessage('estado', MOVEMENT_STATUSES) })
  @IsOptional()
  public estado?: StatusMovement;
}

export class ReopenPeriodDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public motivo: string;
}
