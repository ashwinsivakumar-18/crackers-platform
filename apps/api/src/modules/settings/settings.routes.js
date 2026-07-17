const { Router } = require('express');
const c = require('./settings.controller');
const { validate } = require('../../middleware/validate');
const { authenticate, requireStaff } = require('../../middleware/auth');
const { asyncHandler } = require('../../utils/asyncHandler');
const staff = [authenticate, requireStaff];
const r = Router();
r.get('/public', asyncHandler(c.getPublic));   // no auth — checkout rules for the apps
r.get('/billing', ...staff, asyncHandler(c.getBilling));
r.put('/billing', ...staff, validate({ body: c.billingSchema }), asyncHandler(c.updateBilling));
r.put('/branding', ...staff, validate({ body: c.brandingSchema }), asyncHandler(c.setBranding));
module.exports = r;
