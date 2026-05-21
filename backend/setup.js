/* eslint-disable no-unused-vars */
require('dotenv').config();

const { User } = require('./src/models/user');
const { Token } = require('./src/models/token');
const { Product } = require('./src/models/product');
const { Order } = require('./src/models/order');
const { Category } = require('./src/models/category');
const { Cart } = require('./src/models/cart');
const { client } = require('./src/utils/db');

client.sync({ force: true });
