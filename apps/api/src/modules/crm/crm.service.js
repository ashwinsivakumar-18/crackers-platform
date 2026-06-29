const XLSX = require('xlsx');
const { Customer, CustomerStatus, Communication, FollowUp } = require('../../models');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const { ApiError } = require('../../utils/apiError');

const id = (d) => ({ ...d.toObject ? d.toObject() : d, id: String((d._id || d.id)) });
const normMobile = (m) => { const d = String(m).replace(/\D/g, ''); return d.length === 12 && d.startsWith('91') ? d.slice(2) : d; };

const crmService = {
  async customers(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.statusId) filter.statusId = query.statusId;
    if (query.city) filter.city = query.city;
    if (query.q) filter.$or = [{ name: new RegExp(query.q, 'i') }, { mobile: new RegExp(query.q, 'i') }];
    const [items, total, statuses] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('statusId'),
      Customer.countDocuments(filter),
      CustomerStatus.find(),
    ]);
    const sMap = new Map(statuses.map((s) => [String(s._id), id(s)]));
    return { items: items.map((c) => { const x = id(c); x.status = c.statusId ? sMap.get(String(c.statusId._id || c.statusId)) : null; x.statusId = x.status ? x.status.id : null; return x; }), meta: buildMeta(total, page, limit) };
  },
  async customer(cid) {
    const c = await Customer.findById(cid).populate('statusId');
    if (!c) throw ApiError.notFound('Customer not found');
    const x = id(c); x.status = c.statusId ? id(c.statusId) : null;
    return { customer: x };
  },
  async createCustomer(body) { return { customer: id(await Customer.create({ ...body, mobile: normMobile(body.mobile) })) }; },
  async updateCustomer(cid, body) {
    const c = await Customer.findByIdAndUpdate(cid, body, { new: true });
    if (!c) throw ApiError.notFound('Customer not found');
    return { customer: id(c) };
  },
  async importCustomers(buffer) {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    let imported = 0, duplicates = 0, failed = 0;
    const seen = new Set();
    for (const row of rows) {
      try {
        const mob = normMobile(row.mobile || row.Mobile || row.phone || '');
        if (!/^[6-9]\d{9}$/.test(mob)) { failed++; continue; }
        if (seen.has(mob) || await Customer.exists({ mobile: mob })) { duplicates++; continue; }
        seen.add(mob);
        await Customer.create({ name: row.name || row.Name || 'Customer', mobile: mob, email: row.email || row.Email, city: row.city || row.City, source: 'IMPORT' });
        imported++;
      } catch { failed++; }
    }
    return { batch: { total: rows.length, imported, duplicates, failed } };
  },
  async logCommunication(cid, body) { return { communication: id(await Communication.create({ ...body, customerId: cid })) }; },
  async createFollowUp(cid, body) { return { followUp: id(await FollowUp.create({ ...body, customerId: cid })) }; },

  async statuses() { const s = await CustomerStatus.find().sort({ sortOrder: 1 }); return { statuses: s.map(id) }; },
  async createStatus(body) {
    const count = await CustomerStatus.countDocuments();
    return { status: id(await CustomerStatus.create({ ...body, sortOrder: count })) };
  },
  async updateStatus(sid, body) {
    const s = await CustomerStatus.findByIdAndUpdate(sid, body, { new: true });
    if (!s) throw ApiError.notFound('Status not found');
    return { status: id(s) };
  },
  async deleteStatus(sid) { await CustomerStatus.findByIdAndDelete(sid); return { deleted: true }; },
  async reorderStatuses(order) {
    await Promise.all(order.map((sid, i) => CustomerStatus.updateOne({ _id: sid }, { sortOrder: i })));
    return this.statuses();
  },
};
module.exports = { crmService };
