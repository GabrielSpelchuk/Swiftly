const { Cart, CartItem } = require('../models/cart');
const { Product } = require('../models/product');
const { ApiError } = require('../exeptions/api.error');

async function getOrCreateCart(userId) {
  const [cart] = await Cart.findOrCreate({ where: { userId } });
  return cart;
}

async function getCart(userId) {
  const cart = await getOrCreateCart(userId);

  return Cart.findByPk(cart.id, {
    include: [
      {
        model: CartItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            // supplierId is REQUIRED so the frontend knows which supplier to order from
            attributes: ['id', 'name', 'retailPrice', 'wholesalePrice', 'images', 'stock', 'isActive', 'supplierId'],
          },
        ],
      },
    ],
  });
}

async function addItem(userId, productId, quantity = 1) {
  const product = await Product.findByPk(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');
  if (product.stock < quantity) throw ApiError.badRequest('Insufficient stock');

  const cart = await getOrCreateCart(userId);
  const existingItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });

  if (existingItem) {
    existingItem.quantity += quantity;
    await existingItem.save();
    return existingItem;
  }

  return CartItem.create({ cartId: cart.id, productId, quantity });
}

async function updateItem(userId, itemId, quantity) {
  const cart = await getOrCreateCart(userId);
  const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw ApiError.notFound('Cart item not found');

  if (quantity <= 0) {
    await item.destroy();
    return null;
  }

  item.quantity = quantity;
  return item.save();
}

async function removeItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);
  const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw ApiError.notFound('Cart item not found');
  await item.destroy();
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await CartItem.destroy({ where: { cartId: cart.id } });
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
