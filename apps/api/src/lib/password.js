const argon2 = require('argon2');
const hashPassword = (pw) => argon2.hash(pw, { type: argon2.argon2id });
const verifyPassword = (hash, pw) => argon2.verify(hash, pw);
module.exports = { hashPassword, verifyPassword };
