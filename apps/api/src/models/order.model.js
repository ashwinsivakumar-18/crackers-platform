const { Schema, model } = require('mongoose');

const ORDER_STATUSES = [
  'PENDING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFICATION', 'PAYMENT_APPROVED',
  'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED',
];

const itemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: String, sku: String,
  quantity: Number,
  unitPrice: Number,        // BILLED price on this order (may be edited per order)
  costPrice: Number,        // snapshot of cost at order time
  lineTotal: Number,
}, { _id: false });

const proofSchema = new Schema({
  screenshotUrl: String,
  method: { type: String, enum: ['UPI', 'BANK_TRANSFER'], default: 'UPI' },
  referenceNo: String,
  amount: Number,
  status: { type: String, enum: ['SUBMITTED', 'APPROVED', 'REJECTED'], default: 'SUBMITTED' },
}, { _id: true, timestamps: true });

const historySchema = new Schema({
  status: { type: String, enum: ORDER_STATUSES },
  at: { type: Date, default: Date.now },
  note: String,
}, { _id: false });

const trackingStepSchema = new Schema({
  label: String,        // e.g. 'Order accepted', 'Packed', 'Out for delivery'
  place: String,        // optional location/checkpoint admin types in
  note: String,
  at: { type: Date, default: Date.now },
}, { _id: true });

const orderSchema = new Schema({
  orderNumber: { type: String, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  items: [itemSchema],
  subtotal: Number,
  deliveryFee: { type: Number, default: 0 },
  packingFee: { type: Number, default: 0 },
  extraCharges: [{ label: String, amount: Number }],
  total: Number,
  status: { type: String, enum: ORDER_STATUSES, default: 'PENDING_PAYMENT', index: true },
  deliveryType: { type: String, enum: ['DELIVERY', 'STORE_PICKUP'], default: 'DELIVERY' },
  address: String,
  pincode: String,
  notes: String,
  profit: { type: Number, default: 0 },        // computed from the BILLED prices on this order
  trackingSteps: [trackingStepSchema],         // customer-facing journey (admin adds points)
  paymentProofs: [proofSchema],
  statusHistory: [historySchema],
  placedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = { Order: model('Order', orderSchema), ORDER_STATUSES };
