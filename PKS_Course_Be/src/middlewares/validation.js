const { validationResult } = require('express-validator');
const HttpError = require('../utils/httpError');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(422, 'Validation failed', errors.array()));
  }
  return next();
}

module.exports = validate;
