const { orderService } = require('./order.service');
module.exports = {
  place: async (req, res) => res.status(201).json(await orderService.place(req.user.id, req.body)),
  uploadPayment: async (req, res) => res.json(await orderService.uploadPayment(req.params.id, req.user.id, req.body)),
  myOrders: async (req, res) => res.json(await orderService.myOrders(req.user.id, req.query)),
  detail: async (req, res) => res.json(await orderService.detail(req.params.id, req.user.isStaff ? {} : { userId: req.user.id })),
  adminList: async (req, res) => res.json(await orderService.adminList(req.query)),
  reviewPayment: async (req, res) => res.json(await orderService.reviewPayment(req.params.id, req.params.proofId, req.body.decision, req.body.note)),
  updateStatus: async (req, res) => res.json(await orderService.updateStatus(req.params.id, req.body.status, req.body.note)),
  addTracking: async (req, res) => res.status(201).json(await orderService.addTrackingStep(req.params.id, req.body)),
  updateItemPrice: async (req, res) => res.json(await orderService.updateItemPrice(req.params.id, req.body.index, req.body.unitPrice)),
  setCharges: async (req, res) => res.json(await orderService.setCharges(req.params.id, req.body)),
};
