const { accountService } = require('./account.service');
module.exports = {
  saveLocation: async (req, res) => res.json(await accountService.saveLocation(req.user.id, req.body)),
  locations: async (req, res) => res.json(await accountService.locations(req.user.id)),
  addLocation: async (req, res) => res.status(201).json(await accountService.addLocation(req.user.id, req.body)),
  removeLocation: async (req, res) => res.json(await accountService.removeLocation(req.user.id, req.params.id)),
  setDefaultLocation: async (req, res) => res.json(await accountService.setDefaultLocation(req.user.id, req.params.id)),
  wishlists: async (req, res) => res.json(await accountService.wishlists(req.user.id)),
  createWishlist: async (req, res) => res.status(201).json(await accountService.createWishlist(req.user.id, req.body.name)),
  toggleItem: async (req, res) => res.json(await accountService.toggleItem(req.user.id, Number(req.params.index), req.body.productId)),
};
