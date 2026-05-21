const orderService = require('../services/order.service');
const { ORDER_SOURCE, ORDER_STATUS } = require('../models/order');
const { ApiError } = require('../exeptions/api.error');

async function create(req, res) {
  const { items, customerName, customerPhone, customerAddress, supplierId, notes } = req.body;

  if (!items?.length)
    throw ApiError.badRequest('Order must have at least one item');
  if (!customerName || !customerPhone || !customerAddress)
    throw ApiError.badRequest('Customer name, phone, and address are required');

  // Validate supplierId — must be a real number
  const parsedSupplierId = Number(supplierId);
  if (!supplierId || isNaN(parsedSupplierId) || parsedSupplierId <= 0)
    throw ApiError.badRequest('Valid supplierId is required');

  const source = req.user.role === 'dropshipper' ? ORDER_SOURCE.B2B : ORDER_SOURCE.B2C;

  const order = await orderService.createOrder({
    placedById: req.user.id,
    supplierId: parsedSupplierId,
    source,
    customerInfo: { customerName, customerPhone, customerAddress },
    items,
    notes: notes || null,
  });

  res.status(201).send(order);
}

async function getMyOrders(req, res) {
  const orders = await orderService.getOrdersByUser(req.user.id, req.user.role);
  res.send(orders);
}

async function getOne(req, res) {
  const order = await orderService.getOrderById(req.params.id);
  const isInvolved =
    order.placedById === req.user.id ||
    order.supplierId === req.user.id ||
    req.user.role === 'admin';
  if (!isInvolved) throw ApiError.forbidden();
  res.send(order);
}

async function updateStatus(req, res) {
  if (req.user.role !== 'supplier' && req.user.role !== 'admin')
    throw ApiError.forbidden('Only suppliers can update order status');

  const { status, trackingNumber } = req.body;
  const validStatuses = Object.values(ORDER_STATUS);

  if (!validStatuses.includes(status))
    throw ApiError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`);

  const order = await orderService.updateStatus(
    req.params.id, req.user.id, status, trackingNumber
  );
  res.send(order);
}

module.exports = { create, getMyOrders, getOne, updateStatus };
