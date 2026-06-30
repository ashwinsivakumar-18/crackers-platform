const { z } = require('zod');
module.exports = {
  placeSchema: z.object({
    items: z.array(z.object({ productId: z.string(), quantity: z.coerce.number().int().positive() })).min(1),
    deliveryType: z.enum(['DELIVERY', 'STORE_PICKUP']).default('DELIVERY'),
    address: z.string().optional(),
    pincode: z.string().optional(),
    notes: z.string().optional(),
  }),
  paymentSchema: z.object({
    method: z.enum(['UPI', 'BANK_TRANSFER']).default('UPI'),
    amount: z.coerce.number().positive(),
    screenshotUrl: z.string().url(),
    referenceNo: z.string().optional(),
  }),
  reviewSchema: z.object({ decision: z.enum(['APPROVE', 'REJECT', 'REQUEST_NEW']), note: z.string().optional() }),
  statusSchema: z.object({
    status: z.enum(['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    note: z.string().optional(),
  }),
  listQuery: z.object({ status: z.string().optional(), page: z.string().optional(), limit: z.string().optional() }),
  trackingSchema: z.object({ label: z.string().min(1), place: z.string().optional(), note: z.string().optional() }),
  itemPriceSchema: z.object({ index: z.coerce.number().int().min(0), unitPrice: z.coerce.number().min(0) }),
  chargesSchema: z.object({
    deliveryFee: z.coerce.number().min(0).optional(),
    packingFee: z.coerce.number().min(0).optional(),
    extraCharges: z.array(z.object({ label: z.string(), amount: z.coerce.number() })).optional(),
  }),
};

// Allowed fulfilment transitions (after payment approved).
module.exports.ALLOWED_TRANSITIONS = {
  PAYMENT_APPROVED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
};
