require('dotenv').config();
const { connectDB } = require('../lib/db');
const { startCampaignWorker } = require('./campaign.queue');
const { logger } = require('../lib/logger');

(async () => {
  await connectDB();
  const worker = startCampaignWorker();
  logger.info('campaign worker started');
  const shutdown = async () => { await worker.close(); process.exit(0); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})();
