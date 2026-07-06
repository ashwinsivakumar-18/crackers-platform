const { authService } = require('./auth.service');
const { User } = require('../../models');
const { env } = require('../../config/env');
module.exports = {
  requestOtp: async (req, res) => res.json(await authService.requestOtp(req.body.mobile, req.body.purpose)),
  verifyOtp: async (req, res) => res.json(await authService.verifyOtp(req.body)),
  staffLogin: async (req, res) => res.json(await authService.staffLogin(req.body.mobile, req.body.password)),
  verifyMsg91: async (req, res) => res.json(await authService.verifyMsg91(req.body.accessToken, req.body.name)),
  refresh: async (req, res) => res.json(await authService.refresh(req.body.refreshToken)),
  logout: async (req, res) => res.json(await authService.logout(req.body.refreshToken)),
  otpConfig: async (req, res) => res.json({ widgetId: env.msg91.widgetId, widgetToken: env.msg91.widgetToken }),
  me: async (req, res) => {
    const user = await User.findById(req.user.id).lean();
    res.json({ user: { id: req.user.id, mobile: user.mobile, name: user.name, isStaff: user.isStaff, location: user.location || null }, permissions: req.user.permissions });
  },
};
