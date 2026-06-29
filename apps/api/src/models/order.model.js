const { Schema, model } = require('mongoose');

const ORDER_STATUSES = [
  'PENDING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFICATION', 'PAYMENT_APPROVED',
  'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED',
];

const itemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: String, sku: String,
  quantity: Number, unitPrice: Number, lineTotal: Number,
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

const orderSchema = new Schema({
  orderNumber: { type: String, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  items: [itemSchema],
  subtotal: Number,
  deliveryFee: { type: Number, default: 0 },
  total: Number,
  status: { type: String, enum: ORDER_STATUSES, default: 'PENDING_PAYMENT', index: true },
  deliveryType: { type: String, enum: ['DELIVERY', 'STORE_PICKUP'], default: 'DELIVERY' },
  address: String,
  pincode: String,
  notes: String,
  paymentProofs: [proofSchema],
  statusHistory: [historySchema],
  placedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = { Order: model('Order', orderSchema), ORDER_STATUSES };
