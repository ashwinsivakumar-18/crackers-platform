const { Ticket, User } = require('../../models');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const { ApiError } = require('../../utils/apiError');
const shape = (t) => ({ ...t.toObject ? t.toObject() : t, id: String(t._id) });

const supportService = {
  async create(userId, body) {
    let name = body.name, mobile = body.mobile, email = body.email;
    if (userId) { const u = await User.findById(userId).lean(); if (u) { name = name || u.name; mobile = mobile || u.mobile; email = email || u.email; } }
    const t = await Ticket.create({ type: body.type, subject: body.subject, message: body.message, name, mobile, email, userId, status: 'OPEN' });
    return { ticket: shape(t) };
  },
  async list(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    const [items, total, open] = await Promise.all([
      Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Ticket.countDocuments(filter),
      Ticket.countDocuments({ status: 'OPEN' }),
    ]);
    return { items: items.map(shape), meta: buildMeta(total, page, limit), openCount: open };
  },
  async resolve(id) {
    const t = await Ticket.findByIdAndUpdate(id, { status: 'RESOLVED' }, { new: true });
    if (!t) throw ApiError.notFound('Ticket not found');
    return { ticket: shape(t) };
  },
  async reopen(id) {
    const t = await Ticket.findByIdAndUpdate(id, { status: 'OPEN' }, { new: true });
    if (!t) throw ApiError.notFound('Ticket not found');
    return { ticket: shape(t) };
  },
  async remove(id) { await Ticket.findByIdAndDelete(id); return { deleted: true }; },
};
module.exports = { supportService };
