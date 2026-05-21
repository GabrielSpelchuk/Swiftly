const express = require('express');
const productController = require('../controllers/product.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { optionalAuth } = require('../middlewares/optionalAuth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { catchError } = require('../utils/catchError');

const productRouter = express.Router();

// Public routes — optionalAuth reads token if present (dropshipper sees wholesale price)
productRouter.get('/',    optionalAuth, catchError(productController.getAll));
productRouter.get('/my/list',
  authMiddleware,
  requireRole('supplier', 'admin'),
  catchError(productController.getMine),
);
productRouter.get('/:id', optionalAuth, catchError(productController.getOne));

// Protected routes
productRouter.post('/',
  authMiddleware,
  requireRole('supplier', 'admin'),
  catchError(productController.create),
);
productRouter.put('/:id',
  authMiddleware,
  requireRole('supplier', 'admin'),
  catchError(productController.update),
);
productRouter.delete('/:id',
  authMiddleware,
  requireRole('supplier', 'admin'),
  catchError(productController.remove),
);

module.exports = { productRouter };
