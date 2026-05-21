const { ApiError } = require('../exeptions/api.error');
const jwtService = require('../services/jwt.service');

function authMiddleware(req, res, next) {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');
  if (!authorization || !token) return next(ApiError.unauthorized());
  const userData = jwtService.verify(token);
  if (!userData) return next(ApiError.unauthorized());
  req.user = userData;
  next();
}

module.exports = { authMiddleware };
