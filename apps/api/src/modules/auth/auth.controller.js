const { authService } = require('./auth.service');
const { User } = require('../../models');

module.exports = {
  register: async (req, res) => res.status(201).json(await authService.register(req.body)),
  login: async (req, res) => res.json(await authService.login(req.body)),
  staffLogin: async (req, res) => res.json(await authService.staffLogin(req.body.mobile, req.body.password)),
  forgotVerify: async (req, res) => res.json(await authService.forgotVerify(req.body)),
  forgotReset: async (req, res) => res.json(await authService.forgotReset(req.body)),
  refresh: async (req, res) => res.json(await authService.refresh(req.body.refreshToken)),
  logout: async (req, res) => res.json(await authService.logout(req.body.refreshToken)),
  me: async (req, res) => {
    const user = await User.findById(req.user.id).lean();
    res.json({
      user: { id: req.user.id, mobile: user.mobile, name: user.name, email: user.email, isStaff: user.isStaff, location: user.location || null },
      permissions: req.user.permissions,
    });
  },
};
