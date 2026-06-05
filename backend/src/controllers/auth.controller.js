const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userService = require('../services/user.service');
const jwtService  = require('../services/jwt.service');
const tokenService= require('../services/token.service');
const { sendResetPasswordEmail } = require('../services/email.service');
const { ApiError } = require('../exeptions/api.error');
const { User }    = require('../models/user');

function validateName(v)     { if (!v?.trim()) return 'Name is required'; if (v.length < 2) return 'At least 2 characters'; }
function validateEmail(v)    { if (!v) return 'Email is required'; if (!/^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/.test(v)) return 'Email is not valid'; }
function validatePassword(v) { if (!v) return 'Password is required'; if (v.length < 6) return 'At least 6 characters'; }

async function registration(req, res) {
  const { name, email, password, role, phone, shopUrl, salesChannel, experience } = req.body;
  
  const errors = { name: validateName(name), email: validateEmail(email), password: validatePassword(password) };
  if (errors.name || errors.email || errors.password) throw ApiError.badRequest('Validation failed', errors);
  
  const allowed = ['customer', 'dropshipper', 'supplier'];
  const targetRole = allowed.includes(role) ? role : 'customer';

  if (targetRole === 'dropshipper') {
    if (!phone?.trim()) throw ApiError.badRequest('Номер телефону є обов\'язковим для дропшипера');
    if (!shopUrl?.trim()) throw ApiError.badRequest('Посилання на торгову сторінку є обов\'язковим');
    if (!salesChannel || salesChannel === '') throw ApiError.badRequest('Будь ласка, оберіть основний канал продажів');
    if (!experience?.trim() || experience.trim().length < 10) {
      throw ApiError.badRequest('Будь ласка, напишіть детальніше про свій досвід або додайте посилання на докази (мінімум 10 символів)');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const isApproved = targetRole !== 'dropshipper';

  await userService.register(
    name, 
    email, 
    hashedPassword, 
    targetRole, 
    phone, 
    shopUrl, 
    salesChannel, 
    experience, 
    isApproved
  );

  const message = targetRole === 'dropshipper'
    ? 'Реєстрація успішна. Активуйте email, після чого адміністратор перевірить вашу заявку дропшипера.'
    : 'Registration successful. Please check your email to activate your account.';

  res.send({ message });
}

async function activate(req, res) {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(200).send({ message: 'Already activated or invalid token' });
  }

  user.activationToken = null;
  await user.save();
  res.send({ message: 'Account activated successfully' });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);
  if (!user)                throw ApiError.badRequest('Invalid email or password');
  if (user.activationToken) throw ApiError.badRequest('Please activate your account first');
  if (user.isBlocked)       throw ApiError.forbidden('Your account has been blocked');
  if (!await bcrypt.compare(password, user.password)) throw ApiError.badRequest('Invalid email or password');

  const extra = user.role === 'dropshipper' && !user.isApproved
    ? {
      pendingApproval: true,
      message: 'Ваш акаунт очікує підтвердження адміністратором. Після схвалення ви отримаєте доступ до гуртових цін та замовлень.',
    }
    : {};

  await generateTokens(res, user, extra);
}

async function refresh(req, res) {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw ApiError.unauthorized();
  const userData = jwtService.verifyRefresh(refreshToken);
  if (!userData) throw ApiError.unauthorized();
  const tokenRecord = await tokenService.getByToken(refreshToken);
  if (!tokenRecord) throw ApiError.unauthorized();
  const user = await User.findByPk(userData.id);
  if (!user) throw ApiError.unauthorized();
  await generateTokens(res, user);
}

async function logout(req, res) {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    const userData = jwtService.verifyRefresh(refreshToken);
    if (userData?.id) await tokenService.remove(userData.id);
  }
  res.clearCookie('refreshToken');
  res.sendStatus(204);
}

async function forgotPassword(req, res) {
  const user = await userService.findByEmail(req.body.email);
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    await userService.updateResetToken(user.id, resetToken);
    await sendResetPasswordEmail(user.email, resetToken);
  }
  res.send({ message: "If that email exists, a reset link has been sent." });
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) throw ApiError.badRequest('Token and new password are required');
  if (newPassword.length < 6) throw ApiError.badRequest('Password must be at least 6 characters');
  const user = await userService.findByResetToken(token);
  if (!user) throw ApiError.badRequest('Invalid or expired reset token');
  await userService.updatePassword(user.id, await bcrypt.hash(newPassword, 10));
  res.send({ message: 'Password reset successfully' });
}

async function generateTokens(res, user, extra = {}) {
  const normalizedUser = userService.normalize(user);
  const accessToken    = jwtService.sign(normalizedUser);
  const refreshToken   = jwtService.signRefresh(normalizedUser);
  await tokenService.save(normalizedUser.id, refreshToken);
  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });
  res.send({ user: normalizedUser, accessToken, ...extra });
}

module.exports = { registration, activate, login, refresh, logout, forgotPassword, resetPassword };
