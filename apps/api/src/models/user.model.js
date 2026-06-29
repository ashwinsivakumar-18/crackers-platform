const { Schema, model } = require('mongoose');

const addressSchema = new Schema({
  label: String, line1: String, city: String, pincode: String, isDefault: Boolean,
}, { _id: true });

const userSchema = new Schema({
  mobile: { type: String, required: true, unique: true, index: true },
  name: String,
  email: String,
  passwordHash: String,          // staff only
  isStaff: { type: Boolean, default: false },
  role: { type: String, default: 'CUSTOMER' },
  permissions: { type: [String], default: [] },
  addresses: [addressSchema],
}, { timestamps: true });

module.exports = { User: model('User', userSchema) };
