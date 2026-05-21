const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const Category = client.define(
  'Category',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'categories',
  },
);

module.exports = { Category };
