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
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductQueryDto } from './dto/get-product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  private toResponse(product: Product, isDropshipper: boolean): Product {
    if (isDropshipper) {
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
    isDropshipper: boolean,
  ): Promise<Product> {
    const { category, ...productData } = createProductDto;

    const product = this.productsRepository.create({
      ...productData,
      supplierId,
      categoryId: category ?? null,
    });

    const saved = await this.productsRepository.save(product);

    return this.toResponse(saved, isDropshipper);
  }

  async findAll(query: GetProductQueryDto, isDropshipper: boolean) {
    const { categoryId, minPrice, maxPrice, search, limit, page } = query;

    const where: FindOptionsWhere<Product> = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const priceField = isDropshipper ? 'wholesalePrice' : 'retailPrice';

    if (minPrice !== undefined && maxPrice !== undefined) {
      where[priceField] = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where[priceField] = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      where[priceField] = LessThanOrEqual(maxPrice);
    }

    const [rows, total] = await this.productsRepository.findAndCount({
      where,
      relations: { category: true, supplier: true },
      order: { createdAt: 'DESC' },
      take: limit, // total
      skip: (page - 1) * limit,
    });

    return {
      products: rows.map((product) => this.toResponse(product, isDropshipper)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, isDropshipper: boolean): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
      relations: { category: true, supplier: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toResponse(product, isDropshipper);
  }

  async findBySupplier(
    supplierId: string,
    isDropshipper: boolean,
  ): Promise<Product[]> {
    const rows = await this.productsRepository.find({
      where: { supplierId, isActive: true },
      relations: { category: true, supplier: true },
      order: { createdAt: 'DESC' },
    });

    return rows.map((product) => this.toResponse(product, isDropshipper));
  }

  async update(
    id: string,
    supplierId: string,
    updateProductDto: UpdateProductDto,
    isDropshipper: boolean,
  ): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, supplierId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { category, ...rest } = updateProductDto;

    Object.assign(product, rest);

    if (category !== undefined) {
      product.categoryId = category || null;
    }

    const saved = await this.productsRepository.save(product);

    return this.toResponse(saved, isDropshipper);
  }

  async remove(id: string, supplierId: string): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id, supplierId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.remove(product);
  }
}
