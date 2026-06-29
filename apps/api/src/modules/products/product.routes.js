const { Router } = require('express');
const c = require('./product.controller');
const s = require('./product.schemas');
const { validate } = require('../../middleware/validate');
const { authenticate, requireStaff, requirePermission } = require('../../middleware/auth');
const { asyncHandler } = require('../../utils/asyncHandler');

const staff = (perm) => [authenticate, requireStaff, requirePermission(perm)];
const r = Router();
r.get('/categories', asyncHandler(c.categories));
r.post('/categories', ...staff('product:create'), validate({ body: s.categoryCreate }), asyncHandler(c.createCategory));
r.patch('/categories/:id', ...staff('product:update'), validate({ body: s.categoryUpdate }), asyncHandler(c.updateCategory));
r.get('/', validate({ query: s.listQuery }), asyncHandler(c.list));
r.get('/:idOrSlug', asyncHandler(c.get));
r.post('/', ...staff('product:create'), validate({ body: s.productCreate }), asyncHandler(c.create));
r.patch('/:id', ...staff('product:update'), validate({ body: s.productUpdate }), asyncHandler(c.update));
module.exports = r;
