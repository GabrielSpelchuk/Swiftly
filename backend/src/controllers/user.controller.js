const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const userService = require('../services/user.service');
const { ApiError } = require('../exeptions/api.error');

async function getProfile(req, res) {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'activationToken', 'resetToken'] },
  });
  if (!user) throw ApiError.notFound('User not found');
  res.send(user);
}

async function updateProfile(req, res) {
  const { name, phone, email, currentPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user) throw ApiError.notFound('User not found');

  if (newPassword || (email && email !== user.email)) {
    if (!currentPassword) throw ApiError.badRequest('Current password is required');
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw ApiError.badRequest('Incorrect current password');
  }

  if (email && email !== user.email) user.email = email;
  if (newPassword) {
    if (newPassword !== confirmPassword) throw ApiError.badRequest('Passwords do not match');
    if (newPassword.length < 6) throw ApiError.badRequest('At least 6 characters');
    user.password = await bcrypt.hash(newPassword, 10);
  }
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();
  res.send(userService.normalize(user));
}

module.exports = { getProfile, updateProfile };
