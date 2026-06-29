require('dotenv').config();

function req(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',').map((s) => s.trim()).filter(Boolean),

  mongoUri: req('MONGODB_URI', 'mongodb://localhost:27017/crackers'),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  jwtAccessSecret: req('JWT_ACCESS_SECRET', 'dev_access_secret_change_me'),
  jwtRefreshSecret: req('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '30d',

  otpTtlMinutes: parseInt(process.env.OTP_TTL_MINUTES || '5', 10),
  otpLength: parseInt(process.env.OTP_LENGTH || '6', 10),
  otpMaxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),

  s3: {
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || 'ap-south-1',
    bucket: process.env.S3_BUCKET || 'crackers-media',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    publicUrl: process.env.S3_PUBLIC_URL || 'http://localhost:9000/crackers-media',
  },

  whatsapp: {
    url: process.env.WHATSAPP_API_URL || '',
    token: process.env.WHATSAPP_API_TOKEN || '',
  },

  storeName: process.env.STORE_NAME || 'Sri Lakshmi Crackers',
  storeUpiId: process.env.STORE_UPI_ID || 'store@upi',
};

module.exports = { env };
