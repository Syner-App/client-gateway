import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '../config/index.ts';
import {
  PRODUCTS_SERVICE_NAME,
  type ProductsServiceClient,
} from '../generated/proto/products.ts';
import { CreateProductDto } from './dtos/create-product.dto.ts';
import { UpdateProductDto } from './dtos/update-product.dto.ts';
import { FindProductsDto } from './dtos/find-products.dto.ts';
import { AdjustStockDto } from './dtos/adjust-stock.dto.ts';

@Controller('products')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ProductsController implements OnModuleInit {
  private productsService: ProductsServiceClient;

  constructor(@Inject(PRODUCTS_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.productsService =
      this.client.getService<ProductsServiceClient>(PRODUCTS_SERVICE_NAME);
  }

  @Post()
  createProduct(@Body() payload: CreateProductDto) {
    return this.productsService.create(payload);
  }

  // Filters: categoria, proveedor, nombre, activo, stock_bajo
  @Get()
  findAllProducts(@Query() findProductsDto: FindProductsDto) {
    return this.productsService.findAll(findProductsDto);
  }

  @Get(':id')
  findOneProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne({ id });
  }

  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateProductDto,
  ) {
    return this.productsService.update({ ...payload, id });
  }

  @Delete(':id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove({ id });
  }

  // Inventory movement (entrada | salida); it is recorded in the product history
  @Post(':id/stock')
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() { tipo, cantidad, motivo }: AdjustStockDto,
  ) {
    return this.productsService.adjustStock({ id, tipo, cantidad, motivo });
  }
}
