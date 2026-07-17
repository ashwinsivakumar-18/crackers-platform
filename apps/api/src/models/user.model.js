const { Schema, model } = require('mongoose');

const addressSchema = new Schema({
  label: String, line1: String, city: String, pincode: String, isDefault: Boolean,
}, { _id: true });

const userSchema = new Schema({
  mobile: { type: String, required: true, unique: true, index: true },
  name: String,
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  passwordHash: String,          // staff only
  isStaff: { type: Boolean, default: false },
  role: { type: String, default: 'CUSTOMER' },
  permissions: { type: [String], default: [] },
  addresses: [addressSchema],
  location: { lat: Number, lng: Number, line1: String, line2: String, city: String, state: String, pincode: String },
  wishlists: { type: [{ name: String, productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }] }], default: [] },
  savedLocations: { type: [{
    label: String,
    line1: String, line2: String, line3: String,
    city: String, state: String, pincode: String,
    lat: Number, lng: Number,
    isDefault: { type: Boolean, default: false },
  }], default: [] },
}, { timestamps: true });

module.exports = { User: model('User', userSchema) };
