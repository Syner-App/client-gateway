import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, Matches, Max, Min } from 'class-validator';
import { MovementCategory } from '../../generated/proto/finance.ts';
import { enumMessage } from '../../common/index.ts';
import { DATE, DATE_MESSAGE, OPERATING_EXPENSES, PERIOD, PERIOD_MESSAGE } from './finance-enums.ts';

export class SetAssumptionsDto {
  /** Version in force from this date (default today) */
  @Matches(DATE, { message: DATE_MESSAGE })
  @IsOptional()
  public vigente_desde?: string;

  /** Average price of a granizado */
  @IsInt()
  @IsPositive()
  public precio_promedio: number;

  /** Leave it out to compute it from the recipes */
  @IsInt()
  @IsPositive()
  @IsOptional()
  public costo_variable_unitario?: number;

  @IsInt()
  @Min(0)
  public arriendo: number;

  @IsInt()
  @Min(0)
  public servicios: number;

  @IsInt()
  @Min(0)
  public salarios: number;

  @IsInt()
  @Min(0)
  public otros_fijos: number;

  @IsInt()
  @Min(1)
  @Max(31)
  public dias_operacion: number;

  @IsInt()
  @Min(0)
  public inversion_inicial: number;
}

export class UpdatePolicyDto {
  @IsInt()
  @Min(0)
  @Max(90)
  @IsOptional()
  public dias_cobertura?: number;

  /** Reserve goal in months of fixed costs */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(24)
  @IsOptional()
  public meses_reserva?: number;

  /** Suggested share of the surplus for withdrawals; the rest, for prepayments */
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public porcentaje_retiro?: number;

  @IsArray()
  @ArrayMaxSize(10)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  public niveles_escenario?: number[];

  @IsArray()
  @IsIn(OPERATING_EXPENSES, { each: true, message: enumMessage('categorias_variables', OPERATING_EXPENSES) })
  @IsOptional()
  public categorias_variables?: MovementCategory[];
}

export class PeriodQueryDto {
  /** Default: the current period */
  @Matches(PERIOD, { message: PERIOD_MESSAGE })
  @IsOptional()
  public periodo?: string;
}

export class ScenariosQueryDto {
  /** Granizados per day, comma separated (?niveles=30,50,100); default: the policy levels */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean).map((level) => Number(level.trim())) : value,
  )
  @IsArray()
  @ArrayMaxSize(10)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  public niveles?: number[];
}
