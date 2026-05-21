class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({ message, errors, status: 400 });
  }

  static unauthorized(errors) {
    return new ApiError({ message: 'Unauthorized', errors, status: 401 });
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError({ message, status: 403 });
  }

  static notFound(message = 'Not found') {
    return new ApiError({ message, status: 404 });
  }

  static conflict(message, errors) {
    return new ApiError({ message, errors, status: 409 });
  }
}

module.exports = { ApiError };
