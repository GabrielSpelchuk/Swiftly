const { Category } = require('../models/category');
const { ApiError } = require('../exeptions/api.error');

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

  if (!name) throw ApiError.badRequest('Name is required');

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const category = await Category.create({ name, slug, description });

  res.status(201).send(category);
}

async function update(req, res) {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const { name, description } = req.body;
  if (name) {
    category.name = name;
    category.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  if (description !== undefined) category.description = description;

  await category.save();
  res.send(category);
}

async function remove(req, res) {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  await category.destroy();
  res.sendStatus(204);
}

module.exports = { getAll, getOne, create, update, remove };
