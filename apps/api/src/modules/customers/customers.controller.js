const { customersService } = require('./customers.service');
module.exports = {
  list: async (req, res) => res.json(await customersService.list(req.query)),
  detail: async (req, res) => res.json(await customersService.detail(req.params.id)),
  remove: async (req, res) => res.json(await customersService.remove(req.params.id)),
};
