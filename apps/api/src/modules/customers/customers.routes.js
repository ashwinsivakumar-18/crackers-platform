const { Router } = require('express');
const c = require('./customers.controller');
const { authenticate, requireStaff } = require('../../middleware/auth');
const { asyncHandler } = require('../../utils/asyncHandler');
const staff = [authenticate, requireStaff];
const r = Router();
r.get('/', ...staff, asyncHandler(c.list));
r.get('/:id', ...staff, asyncHandler(c.detail));
module.exports = r;
