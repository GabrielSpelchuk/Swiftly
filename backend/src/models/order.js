const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user');
const { Product } = require('./product');

// Order statuses
const ORDER_STATUS = {
  NEW: 'new',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Order source: B2B (from dropshipper) or B2C (from customer directly)
const ORDER_SOURCE = {
  B2B: 'b2b',
  B2C: 'b2c',
};

const Order = client.define(
  'Order',
  {
    status: {
      type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
      defaultValue: ORDER_STATUS.NEW,
    },
    source: {
      type: DataTypes.ENUM(...Object.values(ORDER_SOURCE)),
      allowNull: false,
    },
    // Customer delivery info
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Tracking number (filled by supplier after shipping)
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalWholesale: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalRetail: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Profit = totalRetail - totalWholesale (for dropshipper)
    profit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'orders',
  },
);

const OrderItem = client.define(
  'OrderItem',
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    priceAtOrder: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    wholesalePriceAtOrder: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'order_items',
  },
);

// Who placed the order (dropshipper or customer)
Order.belongsTo(User, { as: 'placedBy', foreignKey: 'placedById' });
User.hasMany(Order, { as: 'placedOrders', foreignKey: 'placedById' });

// Which supplier fulfills this order
Order.belongsTo(User, { as: 'supplier', foreignKey: 'supplierId' });
User.hasMany(Order, { as: 'supplierOrders', foreignKey: 'supplierId' });

// Order items
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

OrderItem.belongsTo(Product, { as: 'product', foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

module.exports = { Order, OrderItem, ORDER_STATUS, ORDER_SOURCE };
