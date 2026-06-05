const { Category } = require('../models/category');
const { Product } = require('../models/product');
const { ApiError } = require('../exeptions/api.error');
const { uniqueCategorySlug } = require('../utils/slugify');

async function getAll(req, res) {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.send(categories);
}

async function getOne(req, res) {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  res.send(category);
}

async function create(req, res) {
  const { name, description } = req.body;

  if (!name?.trim()) throw ApiError.badRequest('Назва категорії обов\'язкова');

  const trimmedName = name.trim();
  const existing = await Category.findOne({ where: { name: trimmedName } });
  if (existing) throw ApiError.conflict('Категорія з такою назвою вже існує');

  const slug = await uniqueCategorySlug(Category, trimmedName);
  const category = await Category.create({
    name: trimmedName,
    slug,
    description: description?.trim() || null,
  });

  res.status(201).send(category);
}

async function update(req, res) {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Категорію не знайдено');

  const { name, description } = req.body;

  if (name !== undefined) {
    const trimmedName = name.trim();
    if (!trimmedName) throw ApiError.badRequest('Назва категорії не може бути порожньою');

    const duplicate = await Category.findOne({
      where: { name: trimmedName },
    });
    if (duplicate && duplicate.id !== category.id) {
      throw ApiError.conflict('Категорія з такою назвою вже існує');
    }

    category.name = trimmedName;
    category.slug = await uniqueCategorySlug(Category, trimmedName, category.id);
  }

  if (description !== undefined) {
    category.description = description?.trim() || null;
  }

  await category.save();
  res.send(category);
}

async function remove(req, res) {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Категорію не знайдено');

  await Product.update({ categoryId: null }, { where: { categoryId: category.id } });
  await category.destroy();
  res.sendStatus(204);
}

module.exports = { getAll, getOne, create, update, remove };
