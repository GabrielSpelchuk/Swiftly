const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/user');
const { ApiError } = require('../exeptions/api.error');
const { sendActivationEmail } = require('./email.service');

function normalize({ id, name, email, role, balance, phone, isBlocked }) {
  return { id, name, email, role, balance, phone, isBlocked };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findByPk(id);
}

async function register(name, email, password, role = 'customer') {
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.conflict('User already exists', {
      email: 'User already exists',
    });
  }

  const activationToken = uuidv4();

  await User.create({ name, email, password, activationToken, role });
  await sendActivationEmail(email, activationToken);
}

async function updateResetToken(userId, resetToken) {
  return User.update({ resetToken }, { where: { id: userId } });
}

async function findByResetToken(resetToken) {
  return User.findOne({ where: { resetToken } });
}

async function updatePassword(userId, hashedPassword) {
  return User.update(
    { password: hashedPassword, resetToken: null },
    { where: { id: userId } },
  );
}

module.exports = {
  normalize,
  findByEmail,
  findById,
  register,
  updateResetToken,
  findByResetToken,
  updatePassword,
};
