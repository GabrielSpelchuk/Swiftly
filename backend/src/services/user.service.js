const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/user');
const { ApiError } = require('../exeptions/api.error');
const { sendActivationEmail } = require('./email.service');

function normalize(user) {
  const {
    id, name, email, role, balance, phone, isBlocked,
    isApproved, shopUrl, salesChannel, experience,
  } = user;
  return {
    id, name, email, role, balance, phone, isBlocked,
    isApproved: isApproved !== false,
    shopUrl: shopUrl || null,
    salesChannel: salesChannel || null,
    experience: experience || null,
  };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findByPk(id);
}

async function register(
  name,
  email,
  password,
  role = 'customer',
  phone = null,
  shopUrl = null,
  salesChannel = null,
  experience = null,
  isApproved = true,
) {
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.conflict('User already exists', {
      email: 'User already exists',
    });
  }

  const activationToken = uuidv4();
  const isDropshipper = role === 'dropshipper';

  await User.create({
    name,
    email,
    password,
    activationToken,
    role,
    phone: isDropshipper ? phone?.trim() : null,
    shopUrl: isDropshipper ? shopUrl?.trim() : null,
    salesChannel: isDropshipper ? salesChannel : null,
    experience: isDropshipper ? experience?.trim() : null,
    isApproved,
  });
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
