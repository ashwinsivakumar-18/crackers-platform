const { Router } = require('express');
const c = require('./order.controller');
const s = require('./order.schemas');
const { validate } = require('../../middleware/validate');
const { authenticate, requireStaff, requirePermission } = require('../../middleware/auth');
const { asyncHandler } = require('../../utils/asyncHandler');

const staff = (perm) => [authenticate, requireStaff, requirePermission(perm)];
const r = Router();
r.post('/', authenticate, validate({ body: s.placeSchema }), asyncHandler(c.place));
r.get('/', authenticate, validate({ query: s.listQuery }), asyncHandler(c.myOrders));
r.get('/admin/all', ...staff('order:read'), validate({ query: s.listQuery }), asyncHandler(c.adminList));
r.get('/:id', authenticate, asyncHandler(c.detail));
r.post('/:id/payment', authenticate, validate({ body: s.paymentSchema }), asyncHandler(c.uploadPayment));
r.post('/:id/payment/:proofId/review', ...staff('order:update'), validate({ body: s.reviewSchema }), asyncHandler(c.reviewPayment));
r.patch('/:id/status', ...staff('order:update'), validate({ body: s.statusSchema }), asyncHandler(c.updateStatus));
module.exports = r;
