const { AuditLog } = require('../models');
// Fire-and-forget audit write.
function audit(req, action, entity, entityId, meta) {
  AuditLog.create({
    action, entity, entityId: entityId ? String(entityId) : undefined,
    userId: req.user ? req.user.id : undefined,
    meta,
  }).catch(() => {});
}
module.exports = { audit };
