const { Op } = require('sequelize');
const { Product } = require('../models/product');
const { Category } = require('../models/category');
const { User } = require('../models/user');
const { ApiError } = require('../exeptions/api.error');

async function getAll({ categoryId, minPrice, maxPrice, search, page = 1, limit = 12, forDropshipper = false }) {
  const where = { isActive: true };

  if (categoryId) where.categoryId = categoryId;
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  if (minPrice || maxPrice) {
    const priceField = forDropshipper ? 'wholesalePrice' : 'retailPrice';
    where[priceField] = {};
    if (minPrice) where[priceField][Op.gte] = minPrice;
    if (maxPrice) where[priceField][Op.lte] = maxPrice;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: User, as: 'supplier', attributes: ['id', 'name'] },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    products: rows.map(p => normalize(p, forDropshipper)),
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
}

async function getById(id, forDropshipper = false) {
  const product = await Product.findByPk(id, {
    include: [
      { model: Category, as: 'category' },
      { model: User, as: 'supplier', attributes: ['id', 'name'] },
    ],
  });

  if (!product) throw ApiError.notFound('Product not found');

  return normalize(product, forDropshipper);
}

async function getBySupplier(supplierId) {
  return Product.findAll({
    where: { supplierId },
    include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  });
}

async function create(supplierId, data) {
  return Product.create({ ...data, supplierId });
}

async function update(id, supplierId, data) {
  const product = await Product.findOne({ where: { id, supplierId } });

  if (!product) throw ApiError.notFound('Product not found');

  Object.assign(product, data);
  return product.save();
}

async function remove(id, supplierId) {
  const product = await Product.findOne({ where: { id, supplierId } });

  if (!product) throw ApiError.notFound('Product not found');

  await product.destroy();
}

async function decreaseStock(productId, quantity, transaction) {
  const product = await Product.findByPk(productId, { transaction });

  if (!product) throw ApiError.notFound('Product not found');
  if (product.stock < quantity) throw ApiError.badRequest('Insufficient stock');

  product.stock -= quantity;
  await product.save({ transaction });
}

// Hide wholesalePrice for customers, supplierId for everyone except admin/supplier
function normalize(product, forDropshipper = false) {
  const plain = product.toJSON ? product.toJSON() : product;

  if (!forDropshipper) {
    delete plain.wholesalePrice;
  }

  return plain;
}

module.exports = {
  getAll,
  getById,
  getBySupplier,
  create,
  update,
  remove,
  decreaseStock,
  normalize,
};
