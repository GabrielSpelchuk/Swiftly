const express = require('express');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { catchError } = require('../utils/catchError');

const userRouter = express.Router();
userRouter.use(authMiddleware);
userRouter.get('/me', catchError(userController.getProfile));
userRouter.put('/me', catchError(userController.updateProfile));

module.exports = { userRouter };
