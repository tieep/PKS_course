const HttpError = require('../utils/httpError');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function notFoundHandler(req, res, next) {
  next(new HttpError(404, 'Route not found'));
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const payload = {
    success: false,
    message: status === 500 ? 'Internal server error' : error.message,
  };

  if (error.details) payload.details = error.details;
  if (status === 500) console.error(error);
  res.status(status).json(payload);
}

module.exports = { asyncHandler, notFoundHandler, errorHandler };
