const { User } = require('../../models');
const { ApiError } = require('../../utils/apiError');

const locOut = (u) => ({ locations: (u.savedLocations || []).map((l) => ({ ...(l.toObject ? l.toObject() : l), id: String(l._id) })) });

const accountService = {
  async locations(userId) {
    const u = await User.findById(userId).lean();
    if (!u) throw ApiError.notFound('User not found');
    return { locations: (u.savedLocations || []).map((l) => ({ ...l, id: String(l._id) })) };
  },
  async addLocation(userId, loc) {
    const u = await User.findById(userId);
    if (!u) throw ApiError.notFound('User not found');
    if ((u.savedLocations || []).length >= 5) throw ApiError.badRequest('You can save up to 5 locations');
    const makeDefault = loc.isDefault || u.savedLocations.length === 0;
    if (makeDefault) u.savedLocations.forEach((l) => { l.isDefault = false; });
    u.savedLocations.push({ ...loc, isDefault: makeDefault });
    await u.save();
    return locOut(u);
  },
  async removeLocation(userId, id) {
    const u = await User.findById(userId);
    if (!u) throw ApiError.notFound('User not found');
    const doc = u.savedLocations.id(id);
    const wasDefault = doc && doc.isDefault;
    u.savedLocations.pull(id);
    if (wasDefault && u.savedLocations.length) u.savedLocations[0].isDefault = true;
    await u.save();
    return locOut(u);
  },
  async setDefaultLocation(userId, id) {
    const u = await User.findById(userId);
    if (!u) throw ApiError.notFound('User not found');
    u.savedLocations.forEach((l) => { l.isDefault = String(l._id) === id; });
    await u.save();
    return locOut(u);
  },

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
