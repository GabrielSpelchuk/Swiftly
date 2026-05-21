const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./user');

const Token = client.define(
  'Token',
  {
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'tokens',
  },
);

Token.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Token, { foreignKey: 'userId' });

module.exports = { Token };
