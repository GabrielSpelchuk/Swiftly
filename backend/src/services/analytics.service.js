const { QueryTypes } = require('sequelize');
const { client }     = require('../utils/db');
const { Order }      = require('../models/order');
const { Product }    = require('../models/product');
const { User }       = require('../models/user');

async function getSupplierStats(supplierId) {
  const totalOrders    = await Order.count({ where: { supplierId } });
  const revenue        = (await Order.sum('totalRetail', { where: { supplierId } })) || 0;
  const activeProducts = await Product.count({ where: { supplierId, isActive: true } });
  const totalProducts  = await Product.count({ where: { supplierId } });

  const ordersByStatus = await client.query(
    `SELECT status, COUNT(*)::int AS count FROM orders WHERE "supplierId" = :supplierId GROUP BY status`,
    { replacements: { supplierId }, type: QueryTypes.SELECT }
  );

  const topProducts = await client.query(
    `SELECT oi."productId", SUM(oi.quantity)::int AS "totalSold", p.name
     FROM order_items oi
     JOIN products p ON p.id = oi."productId"
     WHERE p."supplierId" = :supplierId
     GROUP BY oi."productId", p.name
     ORDER BY "totalSold" DESC
     LIMIT 5`,
    { replacements: { supplierId }, type: QueryTypes.SELECT }
  );

  return { totalOrders, revenue, ordersByStatus, topProducts, activeProducts, totalProducts };
}

async function getDropshipperStats(dropshipperId) {
  const totalOrders = await Order.count({ where: { placedById: dropshipperId } });
  const totalProfit = (await Order.sum('profit', { where: { placedById: dropshipperId } })) || 0;

  const ordersByStatus = await client.query(
    `SELECT status, COUNT(*)::int AS count FROM orders WHERE "placedById" = :id GROUP BY status`,
    { replacements: { id: dropshipperId }, type: QueryTypes.SELECT }
  );

  const user = await User.findByPk(dropshipperId, { attributes: ['balance'] });

  return { totalOrders, totalProfit, ordersByStatus, balance: Number(user?.balance) || 0 };
}

async function getAdminStats() {
  const totalUsers   = await User.count();
  const totalOrders  = await Order.count();
  const totalRevenue = (await Order.sum('totalRetail')) || 0;

  const usersByRole = await client.query(
    `SELECT role, COUNT(*)::int AS count FROM users GROUP BY role`,
    { type: QueryTypes.SELECT }
  );

  return { totalUsers, usersByRole, totalOrders, totalRevenue };
}

module.exports = { getSupplierStats, getDropshipperStats, getAdminStats };
