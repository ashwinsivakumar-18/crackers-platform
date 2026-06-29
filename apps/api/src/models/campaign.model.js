const { Schema, model } = require('mongoose');

const campaignSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'FESTIVAL_OFFER' },
  channel: { type: String, enum: ['WHATSAPP', 'EMAIL', 'PUSH'], default: 'WHATSAPP' },
  subject: String,
  body: String,
  segment: { type: Object, default: {} },   // { statusIds, cities, tags, customerIds }
  status: { type: String, enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED'], default: 'DRAFT' },
  sentAt: Date,
}, { timestamps: true });

const recipientSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
  sentAt: Date,
  error: String,
}, { timestamps: true });
recipientSchema.index({ campaignId: 1, customerId: 1 }, { unique: true });

module.exports = {
  Campaign: model('Campaign', campaignSchema),
  CampaignRecipient: model('CampaignRecipient', recipientSchema),
};
