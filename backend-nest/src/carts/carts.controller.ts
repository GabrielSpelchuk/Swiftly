import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from '../users/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartsService.getCart(user.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  addItem(@Body() dto: AddCartItemDto, @CurrentUser() user: User) {
    return this.cartsService.addItem(user.id, dto);
  }

  @Put('items/:id')
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: User,
  ) {
    return this.cartsService.updateItem(user.id, id, dto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.cartsService.removeItem(user.id, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCart(@CurrentUser() user: User) {
    return this.cartsService.clearCart(user.id);
  }
}
