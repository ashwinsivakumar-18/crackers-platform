const { User, Order, RefreshToken } = require('../../models');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const { ApiError } = require('../../utils/apiError');

// Admin-facing directory of registered buyers (Users). Not a marketing CRM —
// just visibility: who signed up, their location, and their orders.
const customersService = {
  async list(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isStaff: { $ne: true } };
    if (query.q) filter.$or = [{ name: new RegExp(query.q, 'i') }, { mobile: new RegExp(query.q, 'i') }];
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    const ids = users.map((u) => u._id);
    const counts = await Order.aggregate([
      { $match: { userId: { $in: ids } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, lastAt: { $max: '$createdAt' } } },
    ]);
    const cmap = new Map(counts.map((c) => [String(c._id), c]));
    const items = users.map((u) => ({
      id: String(u._id), name: u.name, mobile: u.mobile, email: u.email,
      city: u.location ? u.location.city : undefined,
      location: u.location || null,
      orderCount: cmap.get(String(u._id)) ? cmap.get(String(u._id)).count : 0,
      lastOrderAt: cmap.get(String(u._id)) ? cmap.get(String(u._id)).lastAt : null,
      joinedAt: u.createdAt,
    }));
    return { items, meta: buildMeta(total, page, limit) };
  },

  async detail(id) {
    const u = await User.findById(id).lean();
    if (!u || u.isStaff) throw ApiError.notFound('Customer not found');
    const orders = await Order.find({ userId: u._id }).sort({ createdAt: -1 }).limit(20).lean();
    return {
      customer: {
        id: String(u._id), name: u.name, mobile: u.mobile, email: u.email,
        location: u.location || null, joinedAt: u.createdAt,
        orders: orders.map((o) => ({ id: String(o._id), orderNumber: o.orderNumber, total: o.total, status: o.status, placedAt: o.placedAt || o.createdAt })),
      },
    };
  },

  // Delete a customer's account + personal data. Past orders are kept as business
  // records but are no longer linked to a live account.
  async remove(id) {
    const u = await User.findById(id);
    if (!u) throw ApiError.notFound('Customer not found');
    if (u.isStaff) throw ApiError.badRequest('Cannot delete a staff account');
    await RefreshToken.deleteMany({ userId: u._id });
    await User.deleteOne({ _id: u._id });
    return { deleted: true };
  },
};
module.exports = { customersService };
