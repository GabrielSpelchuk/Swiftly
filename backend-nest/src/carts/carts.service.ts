import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { Product } from 'src/products/entities/product.entity';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartsService {
  constructor(
    private cartsRepository: Repository<Cart>,
    private productsRepository: Repository<Product>,
    private cartItemsRepository: Repository<CartItem>,
  ) {}

  async getOrCreateCart(userId?: string) {
    let cart = await this.cartsRepository.findOne({
      where: { userId },
      relations: { items: { product: true } },
    });

    if (!cart) {
      try {
        cart = this.cartsRepository.create({ userId });
        await this.cartsRepository.save(cart);
        cart.items = [];
      } catch (error) {
        cart = await this.cartsRepository.findOne({
          where: { userId },
          relations: { items: { product: true } },
        });

        if (!cart) {
          throw error;
        }
      }
    }

    return cart;
  }

  findAll() {
    return `This action returns all carts`;
  }

  async getCart({ userId }: CreateCartDto) {
    const cart = await this.getOrCreateCart(userId);

    if (!cart.items) {
      cart.items = [];
    }

    return cart;
  }

  async addItem(userId: string, productId: string, quantity = 1) {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.cartItemsRepository.findOne({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await this.cartItemsRepository.save(existingItem);
      return existingItem;
    }

    return this.cartItemsRepository.create({
      cartId: cart.id,
      productId,
      quantity,
    });
  }

  async updateItem({ userId, productId, quantity }: UpdateCartDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartItemsRepository.findOne({
      where: { productId, cartId: cart.id },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      await this.cartItemsRepository.remove(item);
      return null;
    }

    item.quantity = quantity;
    return await this.cartItemsRepository.save(item);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartItemsRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartItemsRepository.remove(item);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemsRepository.delete({ cartId: cart.id });
  }
}
