const jwt = require('jsonwebtoken');
const HttpError = require('../utils/httpError');

function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, headerToken] = header.split(' ');
  const token = req.cookies?.access_token || (scheme === 'Bearer' ? headerToken : null);

  if (!token) {
    return next(new HttpError(401, 'Authentication is required'));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You do not have permission for this resource'));
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
