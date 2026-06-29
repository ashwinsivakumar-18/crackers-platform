const { Schema, model } = require('mongoose');
const refreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  tokenHash: { type: String, index: true },
  expiresAt: Date,
  revoked: { type: Boolean, default: false },
}, { timestamps: true });

const otpSchema = new Schema({
  mobile: { type: String, index: true },
  codeHash: String,
  purpose: { type: String, enum: ['LOGIN', 'REGISTER'], default: 'LOGIN' },
  attempts: { type: Number, default: 0 },
  consumed: { type: Boolean, default: false },
  expiresAt: Date,
}, { timestamps: true });

module.exports = {
  RefreshToken: model('RefreshToken', refreshTokenSchema),
  OtpCode: model('OtpCode', otpSchema),
};
