const productService = require('../services/product.service');
const { ApiError } = require('../exeptions/api.error');

async function getAll(req, res) {
  const { categoryId, minPrice, maxPrice, search, page, limit } = req.query;
  const isDropshipper = req.user?.role === 'dropshipper';
  const isSupplierOrAdmin = req.user?.role === 'supplier' || req.user?.role === 'admin';

  const result = await productService.getAll({
    categoryId: categoryId || undefined,
    minPrice:   minPrice   || undefined,
    maxPrice:   maxPrice   || undefined,
    search:     search     || undefined,
    page:  Number(page)  || 1,
    limit: Number(limit) || 12,
    forDropshipper: isDropshipper || isSupplierOrAdmin,
  });
  res.send(result);
}

async function getOne(req, res) {
  const isDropshipper =
    req.user?.role === 'dropshipper' ||
    req.user?.role === 'supplier' ||
    req.user?.role === 'admin';
  const product = await productService.getById(req.params.id, isDropshipper);
  res.send(product);
}

async function getMine(req, res) {
  const products = await productService.getBySupplier(req.user.id);
  res.send(products);
}

async function create(req, res) {
  if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
    throw ApiError.forbidden('Only suppliers can create products');
  }

  const { name, description, wholesalePrice, retailPrice, stock, categoryId, images } = req.body;

  if (!name || !wholesalePrice || !retailPrice) {
    throw ApiError.badRequest('name, wholesalePrice, and retailPrice are required');
  }

  const product = await productService.create(req.user.id, {
    name,
    description: description || null,
    wholesalePrice: Number(wholesalePrice),
    retailPrice:    Number(retailPrice),
    stock:          Number(stock) || 0,
    // Convert empty string → null so Postgres integer FK accepts it
    categoryId: categoryId && categoryId !== '' ? Number(categoryId) : null,
    images: images || [],
  });

  res.status(201).send(product);
}

async function update(req, res) {
  if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
    throw ApiError.forbidden('Only suppliers can update products');
  }

  const data = { ...req.body };

  // Sanitize numeric/nullable fields
  if (data.categoryId === '' || data.categoryId === undefined) data.categoryId = null;
  else data.categoryId = Number(data.categoryId);

  if (data.wholesalePrice !== undefined) data.wholesalePrice = Number(data.wholesalePrice);
  if (data.retailPrice    !== undefined) data.retailPrice    = Number(data.retailPrice);
  if (data.stock          !== undefined) data.stock          = Number(data.stock);

  const product = await productService.update(req.params.id, req.user.id, data);
  res.send(product);
}

async function remove(req, res) {
  if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
    throw ApiError.forbidden('Only suppliers can delete products');
  }
  await productService.remove(req.params.id, req.user.id);
  res.sendStatus(204);
}

module.exports = { getAll, getOne, getMine, create, update, remove };
