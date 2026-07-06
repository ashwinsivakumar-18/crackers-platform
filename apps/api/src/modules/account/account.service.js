const { User } = require('../../models');
const { ApiError } = require('../../utils/apiError');

const accountService = {
  async saveLocation(userId, loc) {
    const user = await User.findByIdAndUpdate(userId, { location: loc }, { new: true });
    if (!user) throw ApiError.notFound('User not found');
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
