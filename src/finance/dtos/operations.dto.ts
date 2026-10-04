import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Account, MovementCategory, StatusPayable, StatusStockDeduction } from '../../generated/proto/finance.ts';
import { PaginationDto } from '../../common/dtos/pagination.dto.ts';
import { enumMessage } from '../../common/index.ts';
import {
  CASH_ACCOUNTS,
  DATE,
  DATE_MESSAGE,
  PAYABLE_STATUSES,
  PERIOD,
  PERIOD_MESSAGE,
  STOCK_DEDUCTION_STATUSES,
  SUPPLY_CATEGORIES,
} from './finance-enums.ts';

// PUT /finance/supplies/:productoId: links a products-ms product as a supply
export class UpsertSupplyDto {
  @IsIn(SUPPLY_CATEGORIES, { message: enumMessage('categoria', SUPPLY_CATEGORIES) })
  public categoria: MovementCategory;

  /** Pesos per unit of the products-ms product */
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  public costo_unitario: number;
}

export class RecipeItemDto {
  @IsInt()
  @IsPositive()
  public supply_id: number;

  /** Units of the products-ms product per unit sold (may be a fraction: 0.05 bags of ice) */
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  public cantidad: number;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public nombre: string;

  @IsInt()
  @IsPositive()
  public precio_venta: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  public items: RecipeItemDto[];
}

export class UpdateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsOptional()
  public nombre?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  public precio_venta?: number;

  @IsBoolean()
  @IsOptional()
  public activo?: boolean;

  /** Replaces every item of the recipe */
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  @IsOptional()
  public items?: RecipeItemDto[];
}

export class SaleLineDto {
  @IsInt()
  @IsPositive()
  public recipe_id: number;

  @IsInt()
  @IsPositive()
  public unidades: number;

  /** Defaults to the recipe price */
  @IsInt()
  @IsPositive()
  @IsOptional()
  public precio_unitario?: number;
}

export class RegisterSaleDto {
  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public fecha?: string;

  @IsIn(CASH_ACCOUNTS, { message: enumMessage('cuenta', CASH_ACCOUNTS) })
  public cuenta: Account;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SaleLineDto)
  public lineas: SaleLineDto[];
}

export class FindSalesDto extends PaginationDto {
  @Matches(PERIOD, { message: PERIOD_MESSAGE })
  @IsOptional()
  public periodo?: string;

  @IsIn(STOCK_DEDUCTION_STATUSES, { message: enumMessage('estado_stock', STOCK_DEDUCTION_STATUSES) })
  @IsOptional()
  public estado_stock?: StatusStockDeduction;
}

export class FindPayablesDto extends PaginationDto {
  @IsIn(PAYABLE_STATUSES, { message: enumMessage('estado', PAYABLE_STATUSES) })
  @IsOptional()
  public estado?: StatusPayable;
}

export class PayPayableDto {
  /** Amount of the bill; it becomes the reference cost of the supply */
  @IsInt()
  @IsPositive()
  public monto_real: number;

  @IsIn(CASH_ACCOUNTS, { message: enumMessage('cuenta', CASH_ACCOUNTS) })
  public cuenta: Account;

  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public fecha?: string;
}

export class CreateCreditDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public nombre: string;

  @IsInt()
  @IsPositive()
  public saldo_capital: number;

  @IsInt()
  @IsPositive()
  public cuota_mensual: number;

  /** Part of the installment the business pays */
  @IsInt()
  @Min(0)
  public cuota_asignada: number;

  @IsInt()
  @Min(1)
  @Max(31)
  public dia_pago: number;
}

/** Corrects the data of a credit; the payments already registered are not touched */
export class UpdateCreditDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsOptional()
  public nombre?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  public saldo_capital?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  public cuota_mensual?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  public cuota_asignada?: number;

  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  public dia_pago?: number;
}

export class PayInstallmentDto {
  @IsIn(CASH_ACCOUNTS, { message: enumMessage('cuenta', CASH_ACCOUNTS) })
  public cuenta: Account;

  @IsInt()
  @IsPositive()
  public monto: number;

  /** Part of the installment that lowers the principal */
  @IsInt()
  @Min(0)
  @IsOptional()
  public abono_capital?: number;

  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public fecha?: string;
}

export class PrepayCreditDto {
  @IsIn(CASH_ACCOUNTS, { message: enumMessage('cuenta', CASH_ACCOUNTS) })
  public cuenta: Account;

  @IsInt()
  @IsPositive()
  public monto: number;

  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public fecha?: string;
}
