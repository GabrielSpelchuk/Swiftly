const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user');
const { Product } = require('./product');

const Cart = client.define(
  'Cart',
  {},
  {
    tableName: 'carts',
  },
);

const CartItem = client.define(
  'CartItem',
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
  },
  {
    tableName: 'cart_items',
  },
);

Cart.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Cart, { foreignKey: 'userId' });

Cart.hasMany(CartItem, { as: 'items', foreignKey: 'cartId', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

CartItem.belongsTo(Product, { as: 'product', foreignKey: 'productId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

module.exports = { Cart, CartItem };
