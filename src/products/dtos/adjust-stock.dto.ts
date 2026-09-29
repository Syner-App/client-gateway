import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { TypeProductHistory } from '../../generated/proto/products.ts';
import { enumMessage, enumValues } from '../../common/index.ts';

const MOVEMENT_TYPES = enumValues(TypeProductHistory);

export class AdjustStockDto {
    @IsIn(MOVEMENT_TYPES, { message: enumMessage('tipo', MOVEMENT_TYPES) })
    public tipo: TypeProductHistory;

    @IsInt()
    @IsPositive()
    @Type(() => Number)
    public cantidad: number;

    @IsString()
    @IsNotEmpty()
    public motivo: string;
}
