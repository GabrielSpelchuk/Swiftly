const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { catchError } = require('../utils/catchError');

const analyticsRouter = express.Router();

analyticsRouter.use(authMiddleware);

// Admin, supplier, dropshipper each get role-specific stats
analyticsRouter.get(
  '/stats',
  requireRole('admin', 'supplier', 'dropshipper'),
  catchError(analyticsController.getStats),
);

module.exports = { analyticsRouter };
