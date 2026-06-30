const { Schema, model } = require('mongoose');

const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  image: String,
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const imageSchema = new Schema({ url: String, alt: String, isPrimary: Boolean }, { _id: false });

const productSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, index: true },
  sku: { type: String, required: true, unique: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
  description: String,
  safetyInstructions: String,
  mrp: { type: Number, required: true },
  costPrice: { type: Number, default: 0 },   // what it costs us — for profit in orders
  sellingPrice: { type: Number, required: true },
  discountType: { type: String, enum: ['NONE', 'PERCENT', 'AMOUNT'], default: 'NONE' },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  images: [imageSchema],
  ratingAvg: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = {
  Category: model('Category', categorySchema),
  Product: model('Product', productSchema),
};
