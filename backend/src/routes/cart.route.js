const express = require('express');
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { catchError } = require('../utils/catchError');

const cartRouter = express.Router();

cartRouter.use(authMiddleware);

cartRouter.get('/', catchError(cartController.getCart));
cartRouter.post('/items', catchError(cartController.addItem));
cartRouter.put('/items/:itemId', catchError(cartController.updateItem));
cartRouter.delete('/items/:itemId', catchError(cartController.removeItem));
cartRouter.delete('/', catchError(cartController.clearCart));

module.exports = { cartRouter };
