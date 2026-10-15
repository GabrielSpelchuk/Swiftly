import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddCartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    await this.cartsRepository.upsert({ userId }, ['userId']);

    const cart = await this.cartsRepository.findOne({
      where: { userId },
      relations: { items: { product: true } },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.items) {
      cart.items = [];
    }

    return cart;
  }

  getCart(userId: string): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartItem> {
    const product = await this.productsRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.cartItemsRepository.findOne({
      where: { cartId: cart.id, productId: dto.productId },
    });

    const wantedQuantity = (existingItem?.quantity ?? 0) + dto.quantity;

    if (product.stock < wantedQuantity) {
      throw new BadRequestException('Insufficient stock');
    }

    if (existingItem) {
      existingItem.quantity = wantedQuantity;
      return this.cartItemsRepository.save(existingItem);
    }

    return this.cartItemsRepository.save(
      this.cartItemsRepository.create({
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      }),
    );
  }

  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartItem | null> {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemsRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity === 0) {
      await this.cartItemsRepository.remove(item);
      return null;
    }

    const product = await this.productsRepository.findOne({
      where: { id: item.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    item.quantity = dto.quantity;
    return this.cartItemsRepository.save(item);
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemsRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemsRepository.remove(item);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemsRepository.delete({ cartId: cart.id });
  }
}
