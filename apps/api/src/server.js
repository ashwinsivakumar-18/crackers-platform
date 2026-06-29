require('dotenv').config();
const { createApp } = require('./app');
const { connectDB, disconnectDB } = require('./lib/db');
const { env } = require('./config/env');
const { logger } = require('./lib/logger');

(async () => {
  await connectDB();
  const app = createApp();
  const server = app.listen(env.port, () => logger.info(`API on http://localhost:${env.port} (${env.nodeEnv})`));
  const shutdown = async () => { server.close(); await disconnectDB(); process.exit(0); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})().catch((e) => { console.error('Fatal startup error:', e); process.exit(1); });
