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

  // MSG91 flow: the client's OTP widget returns a JWT access-token; we verify it
  // server-side with our secret AuthKey, then issue our own tokens for the verified mobile.
  async verifyMsg91(accessToken, name) {
    if (!env.msg91.authKey) throw ApiError.badRequest('OTP provider not configured');
    let data = {};
    try {
      const res = await fetch('https://control.msg91.com/api/v5/widget/verifyAccessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ authkey: env.msg91.authKey, 'access-token': accessToken }),
      });
      data = await res.json().catch(() => ({}));
      if (!res.ok || (data.type && data.type !== 'success')) {
        throw ApiError.unauthorized((data && data.message) || 'OTP verification failed');
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw ApiError.unauthorized('Could not reach OTP provider');
    }
    // MSG91 returns the verified identifier (mobile incl. country code) in `message`.
    const digits = String(data.message || '').replace(/\D/g, '');
    const mobile = digits.length >= 10 ? digits.slice(-10) : null;
    if (!mobile) throw ApiError.badRequest('Verified mobile not returned by provider');
    let user = await User.findOne({ mobile });
    if (!user) user = await User.create({ mobile, name, role: 'CUSTOMER' });
    else if (name && !user.name) { user.name = name; await user.save(); }
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
