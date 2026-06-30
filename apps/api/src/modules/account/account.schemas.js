const { z } = require('zod');
module.exports = {
  locationSchema: z.object({
    lat: z.number().optional(), lng: z.number().optional(),
    line1: z.string().optional(), line2: z.string().optional(),
    city: z.string().optional(), state: z.string().optional(), pincode: z.string().optional(),
  }),
  wishlistCreate: z.object({ name: z.string().min(1) }),
  wishlistItem: z.object({ productId: z.string() }),
};
