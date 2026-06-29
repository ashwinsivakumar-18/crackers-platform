const { Order, Product } = require('../../models');
const { ALLOWED_TRANSITIONS } = require('./order.schemas');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const { generateOrderNumber } = require('../../utils/ids');
const { ApiError } = require('../../utils/apiError');

const shape = (o) => { const x = o.toObject ? o.toObject() : o; x.id = String(x._id); if (x.paymentProofs) x.paymentProofs = x.paymentProofs.map((p) => ({ ...p, id: String(p._id) })); return x; };

const orderService = {
  async place(userId, body) {
    const ids = body.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids }, isActive: true });
    const map = new Map(products.map((p) => [String(p._id), p]));

    const items = [];
    let subtotal = 0;
    for (const line of body.items) {
      const p = map.get(line.productId);
      if (!p) throw ApiError.badRequest(`Product unavailable: ${line.productId}`);
      if (p.stock < line.quantity) throw ApiError.badRequest(`Not enough stock for ${p.name}`);
      const unit = p.sellingPrice;
      items.push({ productId: p._id, productName: p.name, sku: p.sku, quantity: line.quantity, unitPrice: unit, lineTotal: unit * line.quantity });
      subtotal += unit * line.quantity;
    }

    // Atomic-ish stock decrement (works on standalone Mongo); rollback on conflict.
    const done = [];
    for (const line of body.items) {
      const upd = await Product.updateOne({ _id: line.productId, stock: { $gte: line.quantity } }, { $inc: { stock: -line.quantity } });
      if (upd.modifiedCount !== 1) {
        for (const d of done) await Product.updateOne({ _id: d.productId }, { $inc: { stock: d.quantity } });
        throw ApiError.conflict('Stock changed — please try again');
      }
      done.push(line);
    }

    const deliveryFee = body.deliveryType === 'STORE_PICKUP' ? 0 : subtotal > 3000 ? 0 : 80;
    const order = await Order.create({
      orderNumber: generateOrderNumber(), userId, items, subtotal, deliveryFee, total: subtotal + deliveryFee,
      status: 'PENDING_PAYMENT', deliveryType: body.deliveryType, address: body.address, pincode: body.pincode, notes: body.notes,
      statusHistory: [{ status: 'PENDING_PAYMENT' }],
    });
    return { order: shape(order) };
  },

  async uploadPayment(orderId, userId, body) {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) throw ApiError.notFound('Order not found');
    if (!['PENDING_PAYMENT', 'PAYMENT_UPLOADED'].includes(order.status)) throw ApiError.badRequest('Payment already processed');
    order.paymentProofs.push({ screenshotUrl: body.screenshotUrl, method: body.method, amount: body.amount, referenceNo: body.referenceNo, status: 'SUBMITTED' });
    order.status = 'PAYMENT_UPLOADED';
    order.statusHistory.push({ status: 'PAYMENT_UPLOADED' });
    await order.save();
    return { order: shape(order) };
  },

  async reviewPayment(orderId, proofId, decision, note) {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    const proof = order.paymentProofs.id(proofId);
    if (!proof) throw ApiError.notFound('Payment proof not found');
    if (decision === 'APPROVE') { proof.status = 'APPROVED'; order.status = 'PAYMENT_APPROVED'; }
    else { proof.status = 'REJECTED'; order.status = 'PENDING_PAYMENT'; }
    order.statusHistory.push({ status: order.status, note });
    await order.save();
    return { order: shape(order) };
  },

  async updateStatus(orderId, status, note) {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) throw ApiError.badRequest(`Cannot move from ${order.status} to ${status}`);
    if (status === 'CANCELLED') {
      for (const it of order.items) await Product.updateOne({ _id: it.productId }, { $inc: { stock: it.quantity } });
    }
    order.status = status;
    order.statusHistory.push({ status, note });
    await order.save();
    return { order: shape(order) };
  },

  async adminList(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.status) filter.status = query.status;
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name mobile'),
      Order.countDocuments(filter),
    ]);
    return { items: items.map((o) => { const x = shape(o); x.user = o.userId ? { id: String(o.userId._id), name: o.userId.name, mobile: o.userId.mobile } : null; x.userId = x.user ? x.user.id : null; return x; }), meta: buildMeta(total, page, limit) };
  },

  async detail(orderId, opts = {}) {
    const q = { _id: orderId };
    if (opts.userId) q.userId = opts.userId;
    const order = await Order.findOne(q).populate('userId', 'name mobile');
    if (!order) throw ApiError.notFound('Order not found');
    const x = shape(order);
    x.user = order.userId ? { id: String(order.userId._id), name: order.userId.name, mobile: order.userId.mobile } : null;
    return { order: x };
  },

  async myOrders(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ userId }),
    ]);
    return { items: items.map(shape), meta: buildMeta(total, page, limit) };
  },
};
module.exports = { orderService };
