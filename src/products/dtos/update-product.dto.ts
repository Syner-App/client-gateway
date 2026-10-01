import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto.ts';

// stock_actual only changes through POST /products/:id/stock
export class UpdateProductDto extends PartialType(OmitType(CreateProductDto, ['stock_actual'] as const)) { }
