const { Router } = require('express');
const c = require('./support.controller');
const s = require('./support.schemas');
const { validate } = require('../../middleware/validate');
const { authenticate, optionalAuthenticate, requireStaff } = require('../../middleware/auth');
const { asyncHandler } = require('../../utils/asyncHandler');
const staff = [authenticate, requireStaff];
const r = Router();
r.post('/', optionalAuthenticate, validate({ body: s.createSchema }), asyncHandler(c.create));   // customer raises a query
r.get('/', ...staff, validate({ query: s.listQuery }), asyncHandler(c.list));
r.patch('/:id/resolve', ...staff, asyncHandler(c.resolve));
r.patch('/:id/reopen', ...staff, asyncHandler(c.reopen));
r.delete('/:id', ...staff, asyncHandler(c.remove));
module.exports = r;
