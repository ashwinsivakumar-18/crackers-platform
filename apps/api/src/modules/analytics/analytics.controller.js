const { analyticsService } = require('./analytics.service');
module.exports = {
  overview: async (req, res) => res.json(await analyticsService.overview()),
  revenue: async (req, res) => res.json(await analyticsService.revenue(Number(req.query.days) || 7)),
  topProducts: async (req, res) => res.json(await analyticsService.topProducts()),
};
