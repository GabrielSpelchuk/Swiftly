const { client } = require('../utils/db');
const { Order, OrderItem, ORDER_STATUS, ORDER_SOURCE } = require('../models/order');
const { Product } = require('../models/product');
const { User } = require('../models/user');
const { ApiError } = require('../exeptions/api.error');
const productService = require('./product.service');
const { sendOrderStatusEmail } = require('./email.service');

async function createOrder({ placedById, supplierId, source, customerInfo, items, notes }) {
  const transaction = await client.transaction();

  try {
    let totalWholesale = 0;
    let totalRetail = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });

      if (!product || !product.isActive) {
        throw ApiError.badRequest(`Product ${item.productId} not found or inactive`);
      }

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for "${product.name}"`);
      }

      totalWholesale += Number(product.wholesalePrice) * item.quantity;
      totalRetail += Number(product.retailPrice) * item.quantity;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: product.retailPrice,
        wholesalePriceAtOrder: product.wholesalePrice,
      });

      await productService.decreaseStock(item.productId, item.quantity, transaction);
    }

    const profit = totalRetail - totalWholesale;

    const order = await Order.create(
      {
        placedById,
        supplierId,
        source,
        ...customerInfo,
        totalWholesale,
        totalRetail,
        profit,
        notes,
      },
      { transaction },
    );

    for (const item of orderItems) {
      await OrderItem.create({ ...item, orderId: order.id }, { transaction });
    }

    // Credit profit to dropshipper balance
    if (source === ORDER_SOURCE.B2B && placedById) {
      await User.increment('balance', {
        by: profit,
        where: { id: placedById },
        transaction,
      });
    }

    await transaction.commit();

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function getOrdersByUser(userId, role) {
  const where = role === 'supplier'
    ? { supplierId: userId }
    : { placedById: userId };

  return Order.findAll({
    where,
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'images'] }],
      },
      { model: User, as: 'placedBy', attributes: ['id', 'name', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
  });
}

async function getOrderById(id) {
  const order = await Order.findByPk(id, {
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }],
      },
      { model: User, as: 'placedBy', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'supplier', attributes: ['id', 'name', 'email'] },
    ],
  });

  if (!order) throw ApiError.notFound('Order not found');

  return order;
}

async function updateStatus(orderId, supplierId, newStatus, trackingNumber = null) {
  const order = await Order.findOne({ where: { id: orderId, supplierId } });

  if (!order) throw ApiError.notFound('Order not found');

  order.status = newStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  await order.save();

  // Notify customer / dropshipper by email
  const placedBy = await User.findByPk(order.placedById);
  if (placedBy) {
    await sendOrderStatusEmail(placedBy.email, newStatus, trackingNumber);
  }

  return order;
}

module.exports = { createOrder, getOrdersByUser, getOrderById, updateStatus };
