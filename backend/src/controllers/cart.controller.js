const cartService = require('../services/cart.service');

async function getCart(req, res) {
  const cart = await cartService.getCart(req.user.id);
  res.send(cart);
}

async function addItem(req, res) {
  const { productId, quantity } = req.body;
  const item = await cartService.addItem(req.user.id, productId, quantity);
  res.status(201).send(item);
}

async function updateItem(req, res) {
  const item = await cartService.updateItem(req.user.id, req.params.itemId, req.body.quantity);
  res.send(item || { message: 'Item removed' });
}

async function removeItem(req, res) {
  await cartService.removeItem(req.user.id, req.params.itemId);
  res.sendStatus(204);
}

async function clearCart(req, res) {
  await cartService.clearCart(req.user.id);
  res.sendStatus(204);
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
