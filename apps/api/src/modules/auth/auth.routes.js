const { Router } = require('express');
const c = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { asyncHandler } = require('../../utils/asyncHandler');
const { otpLimiter, authLimiter } = require('../../middleware/rateLimit');
const s = require('./auth.schemas');

const r = Router();
r.post('/otp/request', otpLimiter, validate({ body: s.requestOtpSchema }), asyncHandler(c.requestOtp));
r.post('/otp/verify', authLimiter, validate({ body: s.verifyOtpSchema }), asyncHandler(c.verifyOtp));
r.post('/staff/login', authLimiter, validate({ body: s.staffLoginSchema }), asyncHandler(c.staffLogin));
r.post('/refresh', validate({ body: s.refreshSchema }), asyncHandler(c.refresh));
r.post('/logout', asyncHandler(c.logout));
r.get('/me', authenticate, asyncHandler(c.me));
module.exports = r;
