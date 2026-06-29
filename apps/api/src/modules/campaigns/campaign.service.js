const { Campaign, Customer } = require('../../models');
const { buildFilter } = require('../../queue/campaign.queue');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const { ApiError } = require('../../utils/apiError');
const id = (d) => ({ ...d.toObject ? d.toObject() : d, id: String(d._id) });

const campaignService = {
  async list(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = query.status ? { status: query.status } : {};
    const [items, total] = await Promise.all([
      Campaign.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Campaign.countDocuments(filter),
    ]);
    return { items: items.map(id), meta: buildMeta(total, page, limit) };
  },
  async create(body) { return { campaign: id(await Campaign.create(body)) }; },
  async previewAudience(segment) { return { audienceSize: await Customer.countDocuments(buildFilter(segment)) }; },
  async get(cid) { const c = await Campaign.findById(cid); if (!c) throw ApiError.notFound('Not found'); return id(c); },
};
module.exports = { campaignService };
