import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto.ts';
import { enumMessage, ToBoolean } from '../../common/index.ts';
import { TypeCategory } from '../../generated/proto/products.ts';
import { CATEGORIES } from './create-product.dto.ts';

export class FindProductsDto extends PaginationDto {
    @IsIn(CATEGORIES, { message: enumMessage('categoria', CATEGORIES) })
    @IsOptional()
    public categoria?: TypeCategory;

    @IsString()
    @IsOptional()
    public proveedor?: string;

    @IsString()
    @IsOptional()
    public nombre?: string;

    // products-ms lists only active products unless activo=false is sent
    @IsBoolean()
    @IsOptional()
    @ToBoolean()
    public activo?: boolean;

    // stock_actual <= stock_minimo
    @IsBoolean()
    @IsOptional()
    @ToBoolean()
    public stock_bajo?: boolean;
}
