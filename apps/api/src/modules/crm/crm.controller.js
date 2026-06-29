const { crmService } = require('./crm.service');
module.exports = {
  customers: async (req, res) => res.json(await crmService.customers(req.query)),
  customer: async (req, res) => res.json(await crmService.customer(req.params.id)),
  createCustomer: async (req, res) => res.status(201).json(await crmService.createCustomer(req.body)),
  updateCustomer: async (req, res) => res.json(await crmService.updateCustomer(req.params.id, req.body)),
  importCustomers: async (req, res) => res.json(await crmService.importCustomers(req.file.buffer)),
  logCommunication: async (req, res) => res.status(201).json(await crmService.logCommunication(req.params.id, req.body)),
  createFollowUp: async (req, res) => res.status(201).json(await crmService.createFollowUp(req.params.id, req.body)),
  statuses: async (req, res) => res.json(await crmService.statuses()),
  createStatus: async (req, res) => res.status(201).json(await crmService.createStatus(req.body)),
  updateStatus: async (req, res) => res.json(await crmService.updateStatus(req.params.id, req.body)),
  deleteStatus: async (req, res) => res.json(await crmService.deleteStatus(req.params.id)),
  reorderStatuses: async (req, res) => res.json(await crmService.reorderStatuses(req.body.order)),
};
