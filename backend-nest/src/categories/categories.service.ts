import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(search?: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: search ? { name: ILike(`%${search}%`) } : {},
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categoriesRepository.findOne({ where: { name } });
  }

  private findBySlug(slug: string): Promise<Category | null> {
    return this.categoriesRepository.findOne({ where: { slug } });
  }

  private slugify(value: string): string {
    const map: Record<string, string> = {
      а: 'a',
      б: 'b',
      в: 'v',
      г: 'h',
      ґ: 'g',
      д: 'd',
      е: 'e',
      є: 'ie',
      ж: 'zh',
      з: 'z',
      и: 'y',
      і: 'i',
      ї: 'i',
      й: 'i',
      к: 'k',
      л: 'l',
      м: 'm',
      н: 'n',
      о: 'o',
      п: 'p',
      р: 'r',
      с: 's',
      т: 't',
      у: 'u',
      ф: 'f',
      х: 'kh',
      ц: 'ts',
      ч: 'ch',
      ш: 'sh',
      щ: 'shch',
      ь: '',
      ю: 'iu',
      я: 'ia',
    };

    return value
      .toLowerCase()
      .split('')
      .map((char) => map[char] ?? char)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name) || 'category';
    let slug = base;
    let counter = 2;

    while (await this.findBySlug(slug)) {
      slug = `${base}-${counter}`;
      counter += 1;
    }

    return slug;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const name = dto.name.trim();

    if (await this.findByName(name)) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoriesRepository.create({
      name,
      slug: await this.generateUniqueSlug(name),
      description: dto.description?.trim() || null,
    });

    return this.categoriesRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (dto.name) {
      const name = dto.name.trim();

      const existing = await this.findByName(name);
      if (existing && existing.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }

      if (name !== category.name) {
        category.slug = await this.generateUniqueSlug(name);
      }

      category.name = name;
    }

    if (dto.description !== undefined) {
      category.description = dto.description?.trim() || null;
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<string> {
    const category = await this.findById(id);

    await this.categoriesRepository.remove(category);

    return category.id;
  }
}
