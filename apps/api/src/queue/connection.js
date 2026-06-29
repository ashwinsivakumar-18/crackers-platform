const { env } = require('../config/env');
const u = new URL(env.redisUrl);
const queueConnection = {
  host: u.hostname,
  port: Number(u.port || 6379),
  ...(u.username ? { username: u.username } : {}),
  ...(u.password ? { password: u.password } : {}),
};
module.exports = { queueConnection };
