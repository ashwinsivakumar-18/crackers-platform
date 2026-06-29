const { productService } = require('./product.service');
module.exports = {
  list: async (req, res) => res.json(await productService.list(req.query)),
  get: async (req, res) => res.json(await productService.get(req.params.idOrSlug)),
  create: async (req, res) => res.status(201).json(await productService.create(req.body)),
  update: async (req, res) => res.json(await productService.update(req.params.id, req.body)),
  categories: async (req, res) => res.json(await productService.categories()),
  createCategory: async (req, res) => res.status(201).json(await productService.createCategory(req.body)),
  updateCategory: async (req, res) => res.json(await productService.updateCategory(req.params.id, req.body)),
};
