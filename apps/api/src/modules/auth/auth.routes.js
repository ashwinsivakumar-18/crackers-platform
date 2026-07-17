const { Router } = require('express');
const c = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authLimiter } = require('../../middleware/rateLimit');
const s = require('./auth.schemas');

const r = Router();
r.post('/register', authLimiter, validate({ body: s.registerSchema }), asyncHandler(c.register));
r.post('/login', authLimiter, validate({ body: s.loginSchema }), asyncHandler(c.login));
r.post('/staff/login', authLimiter, validate({ body: s.staffLoginSchema }), asyncHandler(c.staffLogin));
r.post('/forgot/verify', authLimiter, validate({ body: s.forgotVerifySchema }), asyncHandler(c.forgotVerify));
r.post('/forgot/reset', authLimiter, validate({ body: s.forgotResetSchema }), asyncHandler(c.forgotReset));
r.post('/refresh', validate({ body: s.refreshSchema }), asyncHandler(c.refresh));
r.post('/logout', asyncHandler(c.logout));
r.get('/me', authenticate, asyncHandler(c.me));
module.exports = r;
