const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  title: String,
  body: String,
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true });

const auditSchema = new Schema({
  action: String, entity: String, entityId: String,
  userId: String, meta: Object,
}, { timestamps: true });

module.exports = {
  Review: model('Review', reviewSchema),
  AuditLog: model('AuditLog', auditSchema),
};
