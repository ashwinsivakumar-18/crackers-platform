const { User, Customer } = require('../../models');
const { ApiError } = require('../../utils/apiError');

const accountService = {
  async saveLocation(userId, loc) {
    const user = await User.findByIdAndUpdate(userId, { location: loc }, { new: true });
    if (!user) throw ApiError.notFound('User not found');
    // Mirror onto the CRM customer so admin sees it on the map.
    await Customer.updateOne(
      { mobile: user.mobile },
      { $setOnInsert: { name: user.name || 'Customer', mobile: user.mobile, source: 'APP' }, $set: { userId: user._id, location: loc, city: loc.city, state: loc.state } },
      { upsert: true },
    );
    return { location: user.location };
  },
  async wishlists(userId) {
    const user = await User.findById(userId).populate('wishlists.productIds').lean();
    return { wishlists: (user.wishlists || []).map((w, i) => ({ index: i, name: w.name, products: w.productIds })) };
  },
  async createWishlist(userId, name) {
    await User.updateOne({ _id: userId }, { $push: { wishlists: { name, productIds: [] } } });
    return this.wishlists(userId);
  },
  async toggleItem(userId, index, productId) {
    const user = await User.findById(userId);
    if (!user || !user.wishlists[index]) throw ApiError.badRequest('Wishlist not found');
    const list = user.wishlists[index];
    const has = list.productIds.some((p) => String(p) === productId);
    list.productIds = has ? list.productIds.filter((p) => String(p) !== productId) : [...list.productIds, productId];
    await user.save();
    return this.wishlists(userId);
  },
};
module.exports = { accountService };
