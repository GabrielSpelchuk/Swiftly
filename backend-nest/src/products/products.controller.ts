import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductQueryDto } from './dto/get-product-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { Roles as Role } from '../utils/roles';

function canSeeWholesale(user?: AuthUser): boolean {
  return (
    user?.role === Role.dropshipper ||
    user?.role === Role.supplier ||
    user?.role === Role.admin
  );
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() query: GetProductQueryDto, @CurrentUser() user?: AuthUser) {
    return this.productsService.findAll(query, canSeeWholesale(user));
  }

  @Roles(Role.supplier, Role.admin)
  @Get('my/list')
  findMine(@CurrentUser() user: AuthUser) {
    return this.productsService.findBySupplier(user.id, true);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: AuthUser) {
    return this.productsService.findById(id, canSeeWholesale(user));
  }

  @Roles(Role.supplier)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.create(createProductDto, user.id, true);
  }

  @Roles(Role.supplier)
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.update(id, user.id, updateProductDto, true);
  }

  @Roles(Role.supplier)
  @Patch(':id')
  updatePartial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.update(id, user.id, updateProductDto, true);
  }

  @Roles(Role.supplier)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.productsService.remove(id, user.id);
  }
}