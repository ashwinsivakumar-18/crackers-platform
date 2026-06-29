const { User, OtpCode, RefreshToken } = require('../../models');
const { generateOtp, hashOtp, verifyOtp } = require('../../lib/otp');
const { verifyPassword } = require('../../lib/password');
const { signAccess, generateRefreshToken, hashToken } = require('../../lib/jwt');
const { ApiError } = require('../../utils/apiError');
const { env } = require('../../config/env');
const { sendWhatsApp } = require('../uploads/notify');

async function issueTokens(user) {
  const access = signAccess({ sub: String(user._id), isStaff: user.isStaff });
  const { raw, hash } = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  await RefreshToken.create({ userId: user._id, tokenHash: hash, expiresAt });
  return {
    user: { id: String(user._id), mobile: user.mobile, name: user.name, isStaff: user.isStaff },
    accessToken: access,
    refreshToken: raw,
  };
}

const authService = {
  async requestOtp(mobile, purpose) {
    const exists = await User.exists({ mobile });
    if (purpose === 'REGISTER' && exists) throw ApiError.conflict('Already registered — please log in', 'EXISTS');
    const code = generateOtp();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + env.otpTtlMinutes * 60 * 1000);
    await OtpCode.create({ mobile, codeHash, purpose, expiresAt });
    await sendWhatsApp(mobile, `Your ${env.storeName} OTP is ${code}. Valid ${env.otpTtlMinutes} min.`);
    return { sent: true };
  },

  async verifyOtp({ mobile, code, purpose, name }) {
    const otp = await OtpCode.findOne({ mobile, purpose, consumed: false }).sort({ createdAt: -1 });
    if (!otp) throw ApiError.badRequest('Request an OTP first');
    if (otp.expiresAt < new Date()) throw ApiError.badRequest('OTP expired');
    if (otp.attempts >= env.otpMaxAttempts) throw ApiError.badRequest('Too many attempts');
    const ok = await verifyOtp(otp.codeHash, code);
    if (!ok) { otp.attempts += 1; await otp.save(); throw ApiError.badRequest('Incorrect OTP'); }
    otp.consumed = true; await otp.save();

    let user = await User.findOne({ mobile });
    if (!user) {
      if (purpose !== 'REGISTER') throw ApiError.badRequest('No account — please register');
      user = await User.create({ mobile, name, role: 'CUSTOMER' });
    }
    return issueTokens(user);
  },

  async staffLogin(mobile, password) {
    const user = await User.findOne({ mobile, isStaff: true });
    if (!user || !user.passwordHash) throw ApiError.unauthorized('Invalid credentials');
    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');
    return issueTokens(user);
  },

  async refresh(rawToken) {
    const hash = hashToken(rawToken);
    const existing = await RefreshToken.findOne({ tokenHash: hash, revoked: false });
    if (!existing || existing.expiresAt < new Date()) throw ApiError.unauthorized('Invalid refresh token');
    existing.revoked = true; await existing.save();           // rotate
    const user = await User.findById(existing.userId);
    if (!user) throw ApiError.unauthorized('User not found');
    return issueTokens(user);
  },

  async logout(rawToken) {
    if (rawToken) await RefreshToken.updateOne({ tokenHash: hashToken(rawToken) }, { revoked: true });
    return { ok: true };
  },
};
module.exports = { authService };
