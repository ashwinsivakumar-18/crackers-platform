const { verifyAccess } = require('../lib/jwt');
const { ApiError } = require('../utils/apiError');
const { User } = require('../models');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Missing token');
    const payload = verifyAccess(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) throw ApiError.unauthorized('User not found');
    req.user = {
      id: String(user._id),
      mobile: user.mobile,
      name: user.name,
      isStaff: user.isStaff,
      permissions: user.permissions || [],
    };
    next();
  } catch (e) {
    if (e instanceof ApiError) return next(e);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

const requireStaff = (req, res, next) => {
  if (!req.user || !req.user.isStaff) return next(ApiError.forbidden('Staff only'));
  next();
};

const requirePermission = (perm) => (req, res, next) => {
  if (!req.user || !req.user.permissions.includes(perm)) return next(ApiError.forbidden(`Missing permission: ${perm}`));
  next();
};

module.exports = { authenticate, requireStaff, requirePermission };
