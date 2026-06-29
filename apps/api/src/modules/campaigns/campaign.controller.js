const { campaignService } = require('./campaign.service');
const { enqueueCampaign } = require('../../queue/campaign.queue');
const { audit } = require('../../middleware/audit');
module.exports = {
  list: async (req, res) => res.json(await campaignService.list(req.query)),
  create: async (req, res) => res.status(201).json(await campaignService.create(req.body)),
  preview: async (req, res) => res.json(await campaignService.previewAudience(req.body.segment)),
  send: async (req, res) => { await campaignService.get(req.params.id); await enqueueCampaign(req.params.id); audit(req, 'campaign.send', 'Campaign', req.params.id); res.status(202).json({ queued: true }); },
};
