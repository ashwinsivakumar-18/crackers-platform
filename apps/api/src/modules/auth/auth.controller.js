const { authService } = require('./auth.service');
const { User } = require('../../models');
module.exports = {
  requestOtp: async (req, res) => res.json(await authService.requestOtp(req.body.mobile, req.body.purpose)),
  verifyOtp: async (req, res) => res.json(await authService.verifyOtp(req.body)),
  staffLogin: async (req, res) => res.json(await authService.staffLogin(req.body.mobile, req.body.password)),
  refresh: async (req, res) => res.json(await authService.refresh(req.body.refreshToken)),
  logout: async (req, res) => res.json(await authService.logout(req.body.refreshToken)),
  me: async (req, res) => {
    const user = await User.findById(req.user.id).lean();
    res.json({ user: { id: req.user.id, mobile: user.mobile, name: user.name, isStaff: user.isStaff }, permissions: req.user.permissions });
  },
};
