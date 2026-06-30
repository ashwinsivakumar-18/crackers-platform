const { Schema, model } = require('mongoose');
// Single settings doc (billing template the admin configures once, reused per order).
const settingsSchema = new Schema({
  key: { type: String, unique: true, default: 'global' },
  billing: {
    deliveryFee: { type: Number, default: 0 },
    packingFee: { type: Number, default: 0 },
    charges: [{ label: String, amount: Number }],   // named presets, e.g. "Gift wrap"
  },
}, { timestamps: true });
module.exports = { Settings: model('Settings', settingsSchema) };
