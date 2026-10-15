import * as bcrypt from 'bcryptjs';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { Roles } from './utils/roles';

const logger = new Logger('Seed');

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const dataSource = app.get(DataSource);
  const users = dataSource.getRepository(User);
  const categories = dataSource.getRepository(Category);
  const products = dataSource.getRepository(Product);

  const password = await bcrypt.hash('password123', 10);

  const accounts = [
    {
      email: 'admin@swiftly.com',
      name: 'Admin',
      role: Roles.admin,
      isApproved: true,
    },
    {
      email: 'supplier@swiftly.com',
      name: 'Supplier',
      role: Roles.supplier,
      isApproved: true,
    },
    {
      email: 'dropshipper@swiftly.com',
      name: 'Dropshipper',
      role: Roles.dropshipper,
      isApproved: true,
    },
    {
      email: 'customer@swiftly.com',
      name: 'Customer',
      role: Roles.customer,
      isApproved: true,
    },
  ];

  const created = new Map<Roles, User>();

  for (const account of accounts) {
    let user = await users.findOne({ where: { email: account.email } });

    if (!user) {
      user = await users.save(
        users.create({
          email: account.email,
          name: account.name,
          password,
          role: account.role,
          isApproved: account.isApproved,
          activationToken: null,
        }),
      );
      logger.log(`user created: ${account.email}`);
    }

    created.set(account.role, user);
  }

  const categoryNames = ['Electronics', 'Clothing', 'Home', 'Beauty'];
  const createdCategories: Category[] = [];

  for (const name of categoryNames) {
    let category = await categories.findOne({ where: { name } });

    if (!category) {
      category = await categories.save(
        categories.create({
          name,
          slug: name.toLowerCase(),
          description: `${name} products`,
        }),
      );
      logger.log(`category created: ${name}`);
    }

    createdCategories.push(category);
  }

  const supplier = created.get(Roles.supplier);

  if (!supplier) {
    throw new Error('Supplier account was not created');
  }

  const catalogue: Array<[string, number, number, number]> = [
    ['Wireless Headphones', 45, 79, 25],
    ['Smart Watch', 90, 149, 15],
    ['Running Shoes', 30, 59, 40],
    ['Cotton T-Shirt', 8, 19, 80],
    ['Ceramic Mug', 5, 12, 60],
    ['Scented Candle', 7, 15, 35],
  ];

  for (const [index, item] of catalogue.entries()) {
    const [name, wholesale, retail, stock] = item;
    const exists = await products.findOne({ where: { name } });

    if (exists) {
      continue;
    }

    await products.save(
      products.create({
        name,
        description: `${name} — seeded demo product`,
        wholesalePrice: wholesale,
        retailPrice: retail,
        stock,
        images: [],
        isActive: true,
        supplierId: supplier.id,
        categoryId: createdCategories[index % createdCategories.length].id,
      }),
    );

    logger.log(`product created: ${name}`);
  }

  logger.log('Seed finished');
  logger.log('Accounts (password for all: password123):');
  for (const account of accounts) {
    logger.log(`  ${account.email} -> ${account.role}`);
  }

  await app.close();
}

seed().catch((error) => {
  logger.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
