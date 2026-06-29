const { z } = require('zod');
const mobile = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile');
module.exports = {
  requestOtpSchema: z.object({ mobile, purpose: z.enum(['LOGIN', 'REGISTER']).default('LOGIN') }),
  verifyOtpSchema: z.object({
    mobile, code: z.string().min(4),
    purpose: z.enum(['LOGIN', 'REGISTER']).default('LOGIN'),
    name: z.string().optional(),
  }),
  staffLoginSchema: z.object({ mobile, password: z.string().min(6) }),
  refreshSchema: z.object({ refreshToken: z.string() }),
};
