'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { client } = require('./utils/db');

require('./models/user');
require('./models/token');
require('./models/category');
require('./models/product');
require('./models/order');
require('./models/cart');

const { authRoute }      = require('./routes/auth.route');
const { userRouter }     = require('./routes/user.route');
const { productRouter }  = require('./routes/product.route');
const { categoryRouter } = require('./routes/category.route');
const { orderRouter }    = require('./routes/order.route');
const { cartRouter }     = require('./routes/cart.route');
const { adminRouter }    = require('./routes/admin.route');
const { analyticsRouter }= require('./routes/analytics.route');
const { errorMiddleware }= require('./middlewares/error.middleware');

const PORT = process.env.PORT || 3005;
const CLIENT = process.env.CLIENT_HOST || 'http://localhost:3000';

const app = express();

app.use(cors({
  origin: CLIENT,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth',      authRoute);
app.use('/users',     userRouter);
app.use('/products',  productRouter);
app.use('/categories',categoryRouter);
app.use('/orders',    orderRouter);
app.use('/cart',      cartRouter);
app.use('/admin',     adminRouter);
app.use('/analytics', analyticsRouter);

app.use((req, res) => res.status(404).send({ message: 'Route not found' }));
app.use(errorMiddleware);

async function start() {
  try {
    await client.authenticate();
    console.log('✅ Database connected');
    await client.sync({ alter: true });
    console.log('✅ Tables synced');
    app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
}

start();
