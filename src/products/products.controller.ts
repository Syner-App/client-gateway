import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { PRODUCTS_SERVICE } from '../config/index.ts';
import {
  PRODUCTS_SERVICE_NAME,
  type CreateProductRequest,
  type ProductsServiceClient,
  type UpdateProductRequest,
} from '../generated/proto/products.ts';
import { PaginationDto } from '../common/dtos/pagination.dto.ts';

@Controller('products')
export class ProductsController implements OnModuleInit {
  private productsService: ProductsServiceClient;

  constructor(@Inject(PRODUCTS_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.productsService =
      this.client.getService<ProductsServiceClient>(PRODUCTS_SERVICE_NAME);
  }

  @Post()
  createProduct(@Body() payload: CreateProductRequest) {
    return this.productsService.create(payload);
  }

  @Get()
  findAllProducts(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':id')
  findOneProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne({ id });
  }

  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: Omit<UpdateProductRequest, 'id'>,
  ) {
    return this.productsService.update({ ...payload, id });
  }

  @Delete(':id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove({ id });
  }
}
