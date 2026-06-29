const { Product, Category } = require('../../models');
const { calculatePrice } = require('../../utils/pricing');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const { slugify } = require('../../utils/ids');
const { ApiError } = require('../../utils/apiError');

const withDisplay = (p) => {
  const o = p.toObject ? p.toObject() : p;
  o.id = String(o._id);
  o.display = calculatePrice({ mrp: o.mrp, discountType: o.discountType, discountPercent: o.discountPercent, discountAmount: o.discountAmount });
  return o;
};
const priceFields = (b) => calculatePrice({ mrp: b.mrp, discountType: b.discountType || 'NONE', discountPercent: b.discountPercent || 0, discountAmount: b.discountAmount || 0 });

const productService = {
  async list(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isActive: true };
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.q) filter.$or = [{ name: new RegExp(query.q, 'i') }, { sku: new RegExp(query.q, 'i') }];
    const sortMap = { priceLow: { sellingPrice: 1 }, priceHigh: { sellingPrice: -1 }, newest: { createdAt: -1 } };
    const sort = sortMap[query.sort] || { createdAt: -1 };
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);
    return { items: items.map(withDisplay), meta: buildMeta(total, page, limit) };
  },

  async get(idOrSlug) {
    const byId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOne(byId ? { _id: idOrSlug } : { slug: idOrSlug });
    if (!product) throw ApiError.notFound('Product not found');
    return { product: withDisplay(product) };
  },

  async create(body) {
    const pf = priceFields(body);
    const product = await Product.create({
      ...body, slug: slugify(body.name) + '-' + Date.now().toString(36),
      sellingPrice: pf.sellingPrice,
    });
    return { product: withDisplay(product) };
  },

  async update(id, body) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    Object.assign(product, body);
    const pf = priceFields({ mrp: product.mrp, discountType: product.discountType, discountPercent: product.discountPercent, discountAmount: product.discountAmount });
    product.sellingPrice = pf.sellingPrice;
    await product.save();
    return { product: withDisplay(product) };
  },

  async categories() {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
    return { categories: categories.map((c) => ({ ...c.toObject(), id: String(c._id) })) };
  },
  async createCategory(body) {
    const category = await Category.create({ ...body, slug: slugify(body.name) });
    return { category: { ...category.toObject(), id: String(category._id) } };
  },
  async updateCategory(id, body) {
    const category = await Category.findByIdAndUpdate(id, body, { new: true });
    if (!category) throw ApiError.notFound('Category not found');
    return { category: { ...category.toObject(), id: String(category._id) } };
  },
};
module.exports = { productService };
