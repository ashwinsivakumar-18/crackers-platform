const IORedis = require('ioredis');
const { env } = require('../config/env');
const redis = new IORedis(env.redisUrl, { maxRetriesPerRequest: null, lazyConnect: false });
redis.on('error', (e) => console.error('[redis]', e.message));
module.exports = { redis };
