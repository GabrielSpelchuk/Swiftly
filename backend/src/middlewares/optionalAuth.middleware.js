const jwtService = require('../services/jwt.service');

// Like authMiddleware but never blocks — just attaches user if token is valid
function optionalAuth(req, res, next) {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (token) {
    const userData = jwtService.verify(token);
    if (userData) req.user = userData;
  }

  next();
}

module.exports = { optionalAuth };
