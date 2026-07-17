const { User, RefreshToken } = require('../../models');
const { hashPassword, verifyPassword } = require('../../lib/password');
const { signAccess, generateRefreshToken, hashToken } = require('../../lib/jwt');
const { ApiError } = require('../../utils/apiError');

async function issueTokens(user) {
  const access = signAccess({ sub: String(user._id), isStaff: user.isStaff });
  const { raw, hash } = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  await RefreshToken.create({ userId: user._id, tokenHash: hash, expiresAt });
  return {
    user: { id: String(user._id), mobile: user.mobile, name: user.name, email: user.email, isStaff: user.isStaff },
    accessToken: access,
    refreshToken: raw,
  };
}

const authService = {
  // Customer creates an account with name + mobile + email + password.
  async register({ name, mobile, email, password }) {
    const em = email.toLowerCase().trim();
    const existing = await User.findOne({ $or: [{ mobile }, { email: em }] });
    if (existing) {
      const which = existing.mobile === mobile ? 'mobile number' : 'email';
      throw ApiError.conflict(`An account with this ${which} already exists — please log in`, 'EXISTS');
    }
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, mobile, email: em, passwordHash, role: 'CUSTOMER' });
    return issueTokens(user);
  },

  // Login with EITHER email or mobile, plus password.
  async login({ identifier, password }) {
    const id = identifier.trim();
    const query = id.includes('@') ? { email: id.toLowerCase() } : { mobile: id.replace(/\D/g, '') };
    const user = await User.findOne(query);
    if (!user || !user.passwordHash) throw ApiError.unauthorized('Invalid credentials');
    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');
    return issueTokens(user);
  },

  async staffLogin(mobile, password) {
    const user = await User.findOne({ mobile, isStaff: true });
    if (!user || !user.passwordHash) throw ApiError.unauthorized('Invalid credentials');
    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');
    return issueTokens(user);
  },

  // Forgot password: confirm the mobile + email belong to the same account.
  async forgotVerify({ mobile, email }) {
    const user = await User.findOne({ mobile, email: email.toLowerCase() });
    if (!user) throw ApiError.notFound('No account matches that mobile and email');
    return { ok: true, name: user.name };
  },
  // ...then set the new password (re-checks the pair server-side).
  async forgotReset({ mobile, email, newPassword }) {
    const user = await User.findOne({ mobile, email: email.toLowerCase() });
    if (!user) throw ApiError.notFound('No account matches that mobile and email');
    user.passwordHash = await hashPassword(newPassword);
    await user.save();
    return { ok: true };
  },

  async refresh(rawToken) {
    const hash = hashToken(rawToken);
    const existing = await RefreshToken.findOne({ tokenHash: hash, revoked: false });
    if (!existing || existing.expiresAt < new Date()) throw ApiError.unauthorized('Invalid refresh token');
    existing.revoked = true; await existing.save();
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
