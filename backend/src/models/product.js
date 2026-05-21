const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user');
const { Category } = require('./category');

const Product = client.define(
  'Product',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Wholesale price (visible to dropshippers)
    wholesalePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Retail price (visible to customers on storefront)
    retailPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'products',
  },
);

// Supplier who owns this product
Product.belongsTo(User, { as: 'supplier', foreignKey: 'supplierId' });
User.hasMany(Product, { as: 'products', foreignKey: 'supplierId' });

Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId' });

module.exports = { Product };
