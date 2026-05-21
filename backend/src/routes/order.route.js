const express = require('express');
const orderController = require('../controllers/order.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { catchError } = require('../utils/catchError');

const orderRouter = express.Router();

orderRouter.use(authMiddleware);

// All authenticated users can create orders and view their own
orderRouter.post('/', catchError(orderController.create));
orderRouter.get('/', catchError(orderController.getMyOrders));
orderRouter.get('/:id', catchError(orderController.getOne));

// Supplier updates status
orderRouter.patch(
  '/:id/status',
  requireRole('supplier', 'admin'),
  catchError(orderController.updateStatus),
);

module.exports = { orderRouter };
