import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { CartItem } from '../carts/entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductQueryDto } from './dto/get-product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
  ) {}

  private toResponse(product: Product, canSeeWholesale: boolean): Product {
    if (canSeeWholesale) {
      return product;
    }

    const { wholesalePrice: _hidden, ...rest } = product;

    if (product.supplier) {
      rest.supplier = {
        id: product.supplier.id,
        name: product.supplier.name,
      } as User;
    }

    return rest as Product;
  }

  async create(
    createProductDto: CreateProductDto,
    supplierId: string,
    canSeeWholesale: boolean,
  ): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      categoryId: createProductDto.categoryId ?? null,
      supplierId,
    });

    const saved = await this.productsRepository.save(product);

    return this.toResponse(saved, canSeeWholesale);
  }

  async findAll(query: GetProductQueryDto, canSeeWholesale: boolean) {
    const { categoryId, minPrice, maxPrice, search, limit, page } = query;

    const where: FindOptionsWhere<Product> = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const priceField = canSeeWholesale ? 'wholesalePrice' : 'retailPrice';

    // isFinite замість !== undefined: NaN потрапляє у запит, якщо клієнт
    // прислав нечислове значення. Between(NaN, ...) у Postgres не падає,
    // а просто не збігається ні з одним рядком — тобто каталог мовчки
    // порожніє. Тому відкидаємо некоректні межі.
    const hasMin = Number.isFinite(minPrice);
    const hasMax = Number.isFinite(maxPrice);

    if (hasMin && hasMax) {
      where[priceField] = Between(minPrice as number, maxPrice as number);
    } else if (hasMin) {
      where[priceField] = MoreThanOrEqual(minPrice as number);
    } else if (hasMax) {
      where[priceField] = LessThanOrEqual(maxPrice as number);
    }

    const [rows, total] = await this.productsRepository.findAndCount({
      where,
      relations: { category: true, supplier: true },
      order: { createdAt: 'DESC' },
      take: limit, // total
      skip: (page - 1) * limit,
    });

    return {
      products: rows.map((product) => this.toResponse(product, canSeeWholesale)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, canSeeWholesale: boolean): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
      relations: { category: true, supplier: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toResponse(product, canSeeWholesale);
  }

  async findBySupplier(
    supplierId: string,
    canSeeWholesale: boolean,
  ): Promise<Product[]> {
    const rows = await this.productsRepository.find({
      where: { supplierId, isActive: true },
      relations: { category: true, supplier: true },
      order: { createdAt: 'DESC' },
    });

    return rows.map((product) => this.toResponse(product, canSeeWholesale));
  }

  async update(
    id: string,
    supplierId: string,
    updateProductDto: UpdateProductDto,
    canSeeWholesale: boolean,
  ): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, supplierId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { categoryId, ...rest } = updateProductDto;

    Object.assign(product, rest);

    if (categoryId !== undefined) {
      product.categoryId = categoryId || null;
    }

    const saved = await this.productsRepository.save(product);

    return this.toResponse(saved, canSeeWholesale);
  }

  async remove(id: string, supplierId: string): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id, supplierId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // М'яке видалення: isActive = false, а не remove().
    //
    // Жорстке видалення падало з 500, якщо товар був у кошику
    // (FK на cart_items.product_id) або в історії замовлень
    // (FK на order_items.product_id). А знищити історію замовлень
    // не можна — це фінансовий документ.
    //
    // isActive вже існує в сутності, і всі запити каталогу
    // фільтрують where: { isActive: true }, тож товар просто
    // зникає з вітрини, але лишається в базі.
    product.isActive = false;

    await this.productsRepository.save(product);

    // Кошик ефемерний — його можна почистити без жодних наслідків.
    await this.cartItemsRepository.delete({ productId: id });
  }
}
