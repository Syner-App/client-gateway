import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TypeCategory } from '../../generated/proto/products.ts';
import { enumMessage, enumValues } from '../../common/index.ts';

export const CATEGORIES = enumValues(TypeCategory);

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    public nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    public codigo_sku: string;

    @IsIn(CATEGORIES, { message: enumMessage('categoria', CATEGORIES) })
    public categoria: TypeCategory;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    public precio: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    public stock_actual?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    public stock_minimo?: number;

    @IsString()
    @IsNotEmpty()
    public proveedor: string;
}
