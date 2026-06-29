const crypto = require('crypto');
const argon2 = require('argon2');
const { env } = require('../config/env');

function generateOtp() {
  const max = 10 ** env.otpLength;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(env.otpLength, '0');
}
const hashOtp = (code) => argon2.hash(code, { type: argon2.argon2id });
const verifyOtp = (hash, code) => argon2.verify(hash, code);
module.exports = { generateOtp, hashOtp, verifyOtp };
