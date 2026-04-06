const { verifyAccessToken } = require('../config/jwt');

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization header',
      data: null,
    });
  }

  try {
    const payload = verifyAccessToken(parts[1]);
    req.user = {
      id: payload.sub,
      student_code: payload.student_code,
      role: payload.role,
    };
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      data: null,
    });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin permission required',
      data: null,
    });
  }

  return next();
}

module.exports = {
  authRequired,
  adminOnly,
};
