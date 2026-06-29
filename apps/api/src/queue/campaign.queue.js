const { Queue, Worker } = require('bullmq');
const { queueConnection } = require('./connection');
const { logger } = require('../lib/logger');

const QUEUE = 'campaigns';
const campaignQueue = new Queue(QUEUE, { connection: queueConnection });

async function enqueueCampaign(campaignId) {
  await campaignQueue.add('send', { campaignId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 1000 });
}


function buildFilter(segment) {
  const f = {};
  if (!segment) return f;
  if (segment.customerIds && segment.customerIds.length) f._id = { $in: segment.customerIds };
  if (segment.statusIds && segment.statusIds.length) f.statusId = { $in: segment.statusIds };
  if (segment.cities && segment.cities.length) f.city = { $in: segment.cities };
  if (segment.tags && segment.tags.length) f.tags = { $in: segment.tags };
  return f;
}

async function dispatch(campaignId) {
  const { Campaign, Customer, CampaignRecipient } = require('../models');
  const { sendWhatsApp, sendEmail } = require('../modules/uploads/notify');
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  const customers = await Customer.find(buildFilter(campaign.segment)).select('mobile email');
  await Campaign.updateOne({ _id: campaignId }, { status: 'SENDING' });
  let sent = 0;
  for (const cst of customers) {
    try {
      if (campaign.channel === 'WHATSAPP') await sendWhatsApp(cst.mobile, campaign.body);
      else if (campaign.channel === 'EMAIL' && cst.email) await sendEmail(cst.email, campaign.subject || campaign.name, campaign.body);
      await CampaignRecipient.updateOne({ campaignId, customerId: cst._id }, { status: 'SENT', sentAt: new Date() }, { upsert: true });
      sent++;
    } catch (e) {
      await CampaignRecipient.updateOne({ campaignId, customerId: cst._id }, { status: 'FAILED', error: e.message }, { upsert: true });
    }
  }
  await Campaign.updateOne({ _id: campaignId }, { status: 'SENT', sentAt: new Date() });
  return { sent, total: customers.length };
}

function startCampaignWorker() {
  const worker = new Worker(QUEUE, async (job) => dispatch(job.data.campaignId), { connection: queueConnection, concurrency: 4 });
  worker.on('completed', (job, r) => logger.info('campaign done', job.id, JSON.stringify(r)));
  worker.on('failed', (job, err) => logger.error('campaign failed', job && job.id, err.message));
  return worker;
}
module.exports = { campaignQueue, enqueueCampaign, startCampaignWorker, buildFilter };
