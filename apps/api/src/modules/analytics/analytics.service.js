const { Order, Customer } = require('../../models');

const analyticsService = {
  async overview() {
    const approved = ['PAYMENT_APPROVED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
    const [revAgg, orders, pending, customers, newC] = await Promise.all([
      Order.aggregate([{ $match: { status: { $in: approved } } }, { $group: { _id: null, sum: { $sum: '$total' }, profit: { $sum: '$profit' } } }]),
      Order.countDocuments(),
      Order.countDocuments({ status: 'PAYMENT_UPLOADED' }),
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 864e5) } }),
    ]);
    return { revenue: revAgg[0] ? revAgg[0].sum : 0, profit: revAgg[0] ? revAgg[0].profit : 0, orders, pendingPayments: pending, customers, newCustomers: newC };
  },
  async revenue(days = 7) {
    const since = new Date(Date.now() - days * 864e5);
    const rows = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return { series: rows.map((r) => ({ day: r._id, revenue: r.revenue, orders: r.orders })) };
  },
  async topProducts() {
    const rows = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', unitsSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.lineTotal' } } },
      { $sort: { unitsSold: -1 } }, { $limit: 10 },
    ]);
    return { products: rows.map((r) => ({ name: r._id, unitsSold: r.unitsSold, revenue: r.revenue })) };
  },
};
module.exports = { analyticsService };
