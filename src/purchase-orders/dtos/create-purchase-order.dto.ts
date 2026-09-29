import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreatePurchaseOrderDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  public producto_id: number;

  @IsString()
  @IsNotEmpty()
  public proveedor: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  public cantidad_solicitada: number;

  @IsString()
  @IsOptional()
  public motivo?: string;
}
