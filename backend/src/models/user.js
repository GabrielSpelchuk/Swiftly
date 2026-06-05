const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

// Roles: admin, supplier, dropshipper, customer
const User = client.define(
  'User',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'supplier', 'dropshipper', 'customer'),
      allowNull: false,
      defaultValue: 'customer',
    },
    activationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    shopUrl: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    salesChannel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
    tableName: 'users',
  },
);

module.exports = { User };
