const { z } = require('zod');
module.exports = {
  createSchema: z.object({
    type: z.enum(['SUPPORT', 'ENQUIRY']).default('SUPPORT'),
    subject: z.string().min(1),
    message: z.string().min(1),
    name: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().email().optional(),
  }),
  listQuery: z.object({ status: z.string().optional(), type: z.string().optional(), page: z.string().optional(), limit: z.string().optional() }),
};
