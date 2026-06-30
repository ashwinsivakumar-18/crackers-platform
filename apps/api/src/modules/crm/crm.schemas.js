const { z } = require('zod');
const mobile = z.string().regex(/^[6-9]\d{9}$/);
module.exports = {
  listQuery: z.object({ q: z.string().optional(), statusId: z.string().optional(), city: z.string().optional(), page: z.string().optional(), limit: z.string().optional() }),
  customerCreate: z.object({ name: z.string().min(1), mobile, email: z.string().email().optional(), city: z.string().optional(), statusId: z.string().optional(), tags: z.array(z.string()).optional(), state: z.string().optional(), location: z.object({ lat: z.number().optional(), lng: z.number().optional(), line1: z.string().optional(), line2: z.string().optional(), city: z.string().optional(), state: z.string().optional(), pincode: z.string().optional() }).optional() }),
  customerUpdate: z.object({ name: z.string().optional(), email: z.string().email().optional(), city: z.string().optional(), statusId: z.string().optional(), tags: z.array(z.string()).optional(), state: z.string().optional(), location: z.object({ lat: z.number().optional(), lng: z.number().optional(), line1: z.string().optional(), line2: z.string().optional(), city: z.string().optional(), state: z.string().optional(), pincode: z.string().optional() }).optional() }),
  statusCreate: z.object({ name: z.string().min(1), color: z.string().default('#8B8175'), icon: z.string().optional() }),
  statusUpdate: z.object({ name: z.string().optional(), color: z.string().optional(), icon: z.string().optional() }),
  reorder: z.object({ order: z.array(z.string()) }),
  comm: z.object({ channel: z.string(), direction: z.string().optional(), summary: z.string().optional(), body: z.string().optional() }),
  followUp: z.object({ dueAt: z.string(), note: z.string().optional() }),
};
