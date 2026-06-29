const { Schema, model } = require('mongoose');

const customerStatusSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#8B8175' },
  icon: String,
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

const customerSchema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, index: true },
  email: String,
  city: String,
  statusId: { type: Schema.Types.ObjectId, ref: 'CustomerStatus', index: true },
  tags: { type: [String], default: [] },
  source: String,
  notes: String,
}, { timestamps: true });
customerSchema.index({ mobile: 1 }, { unique: true });

const communicationSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
  channel: { type: String, enum: ['WHATSAPP', 'CALL', 'EMAIL', 'SMS', 'NOTE'], default: 'NOTE' },
  direction: { type: String, enum: ['IN', 'OUT'], default: 'OUT' },
  summary: String,
  body: String,
}, { timestamps: true });

const followUpSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
  dueAt: Date,
  note: String,
  done: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  CustomerStatus: model('CustomerStatus', customerStatusSchema),
  Customer: model('Customer', customerSchema),
  Communication: model('Communication', communicationSchema),
  FollowUp: model('FollowUp', followUpSchema),
};
