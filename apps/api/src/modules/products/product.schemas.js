const { z } = require('zod');
const discount = {
  discountType: z.enum(['NONE', 'PERCENT', 'AMOUNT']).optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  discountAmount: z.coerce.number().min(0).optional(),
};
const image = z.object({ url: z.string().url(), alt: z.string().optional(), isPrimary: z.boolean().optional() });

module.exports = {
  listQuery: z.object({
    q: z.string().optional(), categoryId: z.string().optional(),
    sort: z.string().optional(), page: z.string().optional(), limit: z.string().optional(),
  }),
  productCreate: z.object({
    name: z.string().min(1), sku: z.string().min(1), categoryId: z.string(),
    description: z.string().optional(), safetyInstructions: z.string().optional(),
    mrp: z.coerce.number().positive(), costPrice: z.coerce.number().min(0).optional(), stock: z.coerce.number().int().min(0).optional(),
    images: z.array(image).optional(), ...discount,
  }),
  productUpdate: z.object({
    name: z.string().optional(), sku: z.string().optional(), categoryId: z.string().optional(),
    description: z.string().optional(), safetyInstructions: z.string().optional(),
    mrp: z.coerce.number().positive().optional(), costPrice: z.coerce.number().min(0).optional(), stock: z.coerce.number().int().min(0).optional(),
    images: z.array(image).optional(), isActive: z.boolean().optional(), ...discount,
  }),
  categoryCreate: z.object({ name: z.string().min(1), image: z.string().url().optional(), sortOrder: z.coerce.number().optional() }),
  categoryUpdate: z.object({ name: z.string().optional(), image: z.string().url().optional(), sortOrder: z.coerce.number().optional() }),
};
