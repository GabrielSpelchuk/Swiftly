const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { catchError } = require('../utils/catchError');

const categoryRouter = express.Router();

// Public
categoryRouter.get('/', catchError(categoryController.getAll));
categoryRouter.get('/:id', catchError(categoryController.getOne));

// Admin only
categoryRouter.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  catchError(categoryController.create),
);

categoryRouter.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  catchError(categoryController.update),
);

categoryRouter.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  catchError(categoryController.remove),
);

module.exports = { categoryRouter };
