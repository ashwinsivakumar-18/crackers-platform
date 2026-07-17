const { supportService } = require('./support.service');
module.exports = {
  create: async (req, res) => res.status(201).json(await supportService.create(req.user ? req.user.id : undefined, req.body)),
  list: async (req, res) => res.json(await supportService.list(req.query)),
  resolve: async (req, res) => res.json(await supportService.resolve(req.params.id)),
  reopen: async (req, res) => res.json(await supportService.reopen(req.params.id)),
  remove: async (req, res) => res.json(await supportService.remove(req.params.id)),
};
