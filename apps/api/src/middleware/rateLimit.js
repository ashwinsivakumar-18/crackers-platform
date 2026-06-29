const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
const otpLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: { message: 'Too many OTP requests' } } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
module.exports = { apiLimiter, otpLimiter, authLimiter };
