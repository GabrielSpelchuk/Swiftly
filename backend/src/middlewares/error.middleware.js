const { ApiError } = require('../exeptions/api.error');

function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors?.[0]?.path || 'поле';
    return res.status(409).send({
      message: `Значення для «${field}» вже зайняте`,
    });
  }

  console.error('[Unhandled error]', error);
  res.status(500).send({ message: 'Internal server error' });
}

module.exports = { errorMiddleware };
