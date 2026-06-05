const { User } = require('../models/user');
const { ApiError } = require('../exeptions/api.error');
const userService = require('../services/user.service');

async function getAllUsers(req, res) {
  const users = await User.findAll({
    attributes: { exclude: ['password', 'activationToken', 'resetToken'] },
    order: [['createdAt', 'DESC']],
  });
  res.send(users);
}

async function blockUser(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') throw ApiError.forbidden('Cannot block another admin');

  user.isBlocked = true;
  await user.save();

  res.send({ message: 'User blocked', user: userService.normalize(user) });
}

async function unblockUser(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isBlocked = false;
  await user.save();

  res.send({ message: 'User unblocked', user: userService.normalize(user) });
}

async function deleteUser(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') throw ApiError.forbidden('Cannot delete another admin');

  await user.destroy();
  res.sendStatus(204);
}

async function getPendingDropshippers(req, res) {
  const pendingUsers = await User.findAll({
    where: {
      role: 'dropshipper',
      isApproved: false,
      activationToken: null,
    },
    attributes: { exclude: ['password', 'activationToken', 'resetToken'] },
    order: [['createdAt', 'DESC']],
  });
  res.send(pendingUsers);
}

async function reviewDropshipper(req, res) {
  const { userId } = req.params;
  const { status } = req.body; // 'approve' або 'reject'

  const user = await User.findByPk(userId);
  if (!user || user.role !== 'dropshipper') {
    throw ApiError.notFound('Дропшипера не знайдено');
  }

  if (status === 'approve') {
    user.isApproved = true;
    await user.save();
    return res.send({ message: 'Дропшипера успішно підтверджено!' });
  } 
  
  if (status === 'reject') {
    user.role = 'customer';
    user.shopUrl = null;
    user.phone = null;
    user.salesChannel = null;
    user.experience = null;
    user.isApproved = true;
    await user.save();
    return res.send({ message: 'Заявку відхилено. Користувачу присвоєно роль покупця.' });
  }

  throw ApiError.badRequest('Невідомий статус рішення');
}

module.exports = { getAllUsers, blockUser, unblockUser, deleteUser, getPendingDropshippers, reviewDropshipper };
