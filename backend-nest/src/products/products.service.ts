import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { GetProductQueryDto } from './dto/get-product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}
  private normalize(product: Product, forDropshipper = false) {
    const plain = { ...product } as Record<string, any>;

    if (product.supplier) {
      plain.supplier = {
        id: product.supplier.id,
        name: product.supplier.name,
      };
    }

    if (!forDropshipper) {
      delete plain.wholesalePrice;
    }

    return plain;
  }

  async create(createProductDto: CreateProductDto, supplierId: string) {
    const { category, ...productData } = createProductDto;

    const product = this.productsRepository.create({
      ...productData,
      supplierId,
      categoryId: category,
    });

    return await this.productsRepository.save(product);
  }

  async findAll(query: GetProductQueryDto, forDropshipper = false) {
    const {
      categoryId,
      minPrice,
      maxPrice,
      search,
      limit = 4,
      page = 1,
    } = query;

    const where: FindOptionsWhere<Product> = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const priceField = forDropshipper ? 'wholesalePrice' : 'retailPrice';

    if (minPrice !== undefined && maxPrice !== undefined) {
      where[priceField] = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where[priceField] = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      where[priceField] = LessThanOrEqual(maxPrice);
    }

    const [rows, count] = await this.productsRepository.findAndCount({
      where,
      relations: {
        category: true,
        supplier: true,
      },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return {
      products: rows.map((p) => this.normalize(p, forDropshipper)),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: string, forDropshipper = false) {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
      relations: {
        category: true,
        supplier: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.normalize(product, forDropshipper);
  }

  async getBySupplier(supplierId: string, forDropshipper = false) {
    const rows = await this.productsRepository.find({
      where: {
        supplierId,
        isActive: true,
      },
      relations: {
        category: true,
        supplier: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return rows.map((product) => this.normalize(product, forDropshipper));
  }

  async update(
    id: string,
    supplierId: string,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsRepository.findOne({
      where: { id, supplierId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updateProductDto);

    return this.productsRepository.save(product);
  }

  async remove(id: string, supplierId: string) {
    const product = await this.productsRepository.findOne({
      where: { id, supplierId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.remove(product);
  }
}
