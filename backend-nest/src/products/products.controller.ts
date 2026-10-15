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
import { CurrentUser } from '../users/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Roles } from '../utils/roles';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: GetProductQueryDto, @CurrentUser() user: User) {
    return this.productsService.findAll(query, user.role === Roles.dropshipper);
  }

  @Get('my/list')
  findMine(@CurrentUser() user: User) {
    return this.productsService.findBySupplier(user.id, true);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.productsService.findById(id, user.role === Roles.dropshipper);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.create(
      createProductDto,
      user.id,
      user.role === Roles.dropshipper,
    );
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.update(
      id,
      user.id,
      updateProductDto,
      user.role === Roles.dropshipper,
    );
  }

  @Patch(':id')
  updatePartial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.update(
      id,
      user.id,
      updateProductDto,
      user.role === Roles.dropshipper,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.productsService.remove(id, user.id);
  }
}
