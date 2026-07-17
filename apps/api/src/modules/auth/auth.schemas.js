const { z } = require('zod');
const mobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile');
const password = z.string().min(6, 'Password must be at least 6 characters');
const email = z.string().email('Enter a valid email');

module.exports = {
  registerSchema: z.object({ name: z.string().min(1), mobile, email, password }),
  loginSchema: z.object({ identifier: z.string().min(3), password: z.string().min(1) }),
  staffLoginSchema: z.object({ mobile, password: z.string().min(6) }),
  forgotVerifySchema: z.object({ mobile, email }),
  forgotResetSchema: z.object({ mobile, email, newPassword: password }),
  refreshSchema: z.object({ refreshToken: z.string() }),
};
