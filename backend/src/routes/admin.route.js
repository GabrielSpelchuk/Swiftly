const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { catchError } = require('../utils/catchError');

const adminRouter = express.Router();

adminRouter.use(authMiddleware, requireRole('admin'));

// User management
adminRouter.get('/users', catchError(adminController.getAllUsers));
adminRouter.patch('/users/:id/block', catchError(adminController.blockUser));
adminRouter.patch('/users/:id/unblock', catchError(adminController.unblockUser));
adminRouter.delete('/users/:id', catchError(adminController.deleteUser));

adminRouter.get('/dropshippers/pending', catchError(adminController.getPendingDropshippers));
adminRouter.patch('/dropshippers/:userId/review', catchError(adminController.reviewDropshipper));

module.exports = { adminRouter };
