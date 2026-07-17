const { z } = require('zod');
module.exports = {
  locationSchema: z.object({
    lat: z.number().optional(), lng: z.number().optional(),
    line1: z.string().optional(), line2: z.string().optional(),
    city: z.string().optional(), state: z.string().optional(), pincode: z.string().optional(),
  }),
  savedLocationSchema: z.object({
    label: z.string().optional(),
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    line3: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    pincode: z.string().regex(/^\d{6}$/, 'Enter a 6-digit pincode'),
    lat: z.number().optional(), lng: z.number().optional(),
    isDefault: z.boolean().optional(),
  }),
  wishlistCreate: z.object({ name: z.string().min(1) }),
  wishlistItem: z.object({ productId: z.string() }),
};
