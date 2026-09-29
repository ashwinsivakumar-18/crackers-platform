require('dotenv').config();
const { connectDB, disconnectDB } = require('../src/lib/db');
const { User, Category, Product } = require('../src/models');
const { hashPassword } = require('../src/lib/password');
const { calculatePrice } = require('../src/utils/pricing');
const { slugify } = require('../src/utils/ids');

const ALL_PERMS = ['product:create', 'product:update', 'order:read', 'order:update'];

(async () => {
  await connectDB();

  // Admin staff user
  const adminMobile = process.env.ADMIN_MOBILE;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminMobile || !adminPassword) throw new Error('Set ADMIN_MOBILE and ADMIN_PASSWORD before running the seed');
  const passwordHash = await hashPassword(adminPassword);
  await User.updateOne(
    { mobile: adminMobile },
    { $set: { name: 'Store Admin', isStaff: true, role: 'ADMIN', permissions: ALL_PERMS, passwordHash } },
    { upsert: true },
  );


  // A couple of generic categories + products (rename freely in Inventory)
  const catA = await Category.findOneAndUpdate({ slug: 'category-a' }, { $set: { name: 'Category A', slug: 'category-a', sortOrder: 0 } }, { upsert: true, new: true });
  const sample = [
    { name: 'Product 1', sku: 'A-001', mrp: 250, discountType: 'PERCENT', discountPercent: 40, stock: 100 },
    { name: 'Product 2', sku: 'A-002', mrp: 500, discountType: 'PERCENT', discountPercent: 50, stock: 80 },
  ];
  for (const p of sample) {
    const price = calculatePrice(p);
    await Product.updateOne({ sku: p.sku }, { $set: { ...p, slug: slugify(p.name), categoryId: catA._id, sellingPrice: price.sellingPrice } }, { upsert: true });
  }

  console.log('Seed complete. Admin account configured from environment variables.');
  await disconnectDB();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
