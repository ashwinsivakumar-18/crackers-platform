const { z } = require('zod');
const segment = z.object({
  statusIds: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  customerIds: z.array(z.string()).optional(),
}).optional();
module.exports = {
  createSchema: z.object({
    name: z.string().min(1), type: z.string().default('FESTIVAL_OFFER'),
    channel: z.enum(['WHATSAPP', 'EMAIL', 'PUSH']).default('WHATSAPP'),
    subject: z.string().optional(), body: z.string().min(1), segment,
  }),
  previewSchema: z.object({ segment }),
  listQuery: z.object({ status: z.string().optional(), page: z.string().optional(), limit: z.string().optional() }),
};
