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
import { Auth, OrganizationId, Roles } from '../auth/decorators/index.ts';
import { MANAGER_ROLES } from '../auth/roles.ts';

// Any member of the organization can read and move stock; only owner/admin manage products.
// Every call is scoped to the organization of the token (@OrganizationId)
@Auth()
@Controller('products')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ProductsController implements OnModuleInit {
  private productsService: ProductsServiceClient;

  constructor(@Inject(PRODUCTS_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.productsService =
      this.client.getService<ProductsServiceClient>(PRODUCTS_SERVICE_NAME);
  }

  @Roles(...MANAGER_ROLES)
  @Post()
  createProduct(@Body() payload: CreateProductDto, @OrganizationId() organization_id: string) {
    return this.productsService.create({ ...payload, organization_id });
  }

  // Filters: categoria, proveedor, nombre, activo, stock_bajo
  @Get()
  findAllProducts(@Query() findProductsDto: FindProductsDto, @OrganizationId() organization_id: string) {
    return this.productsService.findAll({ ...findProductsDto, organization_id });
  }

  @Get(':id')
  findOneProduct(@Param('id', ParseIntPipe) id: number, @OrganizationId() organization_id: string) {
    return this.productsService.findOne({ id, organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateProductDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.productsService.update({ ...payload, id, organization_id });
  }

  @Roles(...MANAGER_ROLES)
  @Delete(':id')
  deleteProduct(@Param('id', ParseIntPipe) id: number, @OrganizationId() organization_id: string) {
    return this.productsService.remove({ id, organization_id });
  }

  // Inventory movement (entrada | salida); it is recorded in the product history
  @Post(':id/stock')
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() { tipo, cantidad, motivo }: AdjustStockDto,
    @OrganizationId() organization_id: string,
  ) {
    return this.productsService.adjustStock({ id, tipo, cantidad, motivo, organization_id });
  }
}
