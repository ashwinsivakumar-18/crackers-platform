const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/env');

function signAccess(payload) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtl });
}
function verifyAccess(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}
// Refresh tokens are opaque random strings; only their hash is stored.
function generateRefreshToken() {
  const raw = crypto.randomBytes(40).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}
function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
module.exports = { signAccess, verifyAccess, generateRefreshToken, hashToken };
