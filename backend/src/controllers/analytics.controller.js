const analyticsService = require('../services/analytics.service');
const { ApiError } = require('../exeptions/api.error');

async function getStats(req, res) {
  const { role, id } = req.user;

  if (role === 'admin') {
    const stats = await analyticsService.getAdminStats();
    return res.send(stats);
  }

  if (role === 'supplier') {
    const stats = await analyticsService.getSupplierStats(id);
    return res.send(stats);
  }

  if (role === 'dropshipper') {
    const stats = await analyticsService.getDropshipperStats(id);
    return res.send(stats);
  }

  throw ApiError.forbidden('Analytics not available for your role');
}

module.exports = { getStats };
