const { Schema, model } = require('mongoose');

const customerStatusSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#8B8175' },
  icon: String,
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

const locationSchema = new Schema({
  lat: Number, lng: Number,
  line1: String, line2: String, city: String, state: String, pincode: String,
}, { _id: false });

const customerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true, index: true },   // phone is mandatory
  email: String,                                            // optional
  city: String,
  state: String,
  location: locationSchema,
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
