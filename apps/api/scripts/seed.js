require('dotenv').config();
const { connectDB, disconnectDB } = require('../src/lib/db');
const { User, CustomerStatus, Category, Product } = require('../src/models');
const { hashPassword } = require('../src/lib/password');
const { calculatePrice } = require('../src/utils/pricing');
const { slugify } = require('../src/utils/ids');

const ALL_PERMS = ['product:create', 'product:update', 'order:read', 'order:update', 'crm:read', 'crm:update', 'campaign:send'];

(async () => {
  await connectDB();

  // Admin staff user
  const passwordHash = await hashPassword('ChangeMe@123');
  await User.updateOne(
    { mobile: '9000000000' },
    { $set: { name: 'Store Admin', isStaff: true, role: 'ADMIN', permissions: ALL_PERMS, passwordHash } },
    { upsert: true },
  );

  // Default CRM statuses
  const statuses = [
    { name: 'New lead', color: '#3b82f6', sortOrder: 0 },
    { name: 'Enquiry', color: '#E69A1F', sortOrder: 1 },
    { name: 'Repeat buyer', color: '#1E8A52', sortOrder: 2 },
    { name: 'Wholesale', color: '#8b5cf6', sortOrder: 3 },
  ];
  for (const s of statuses) await CustomerStatus.updateOne({ name: s.name }, { $set: s }, { upsert: true });

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

  console.log('Seed complete. Admin login: mobile 9000000000 / password ChangeMe@123');
  await disconnectDB();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
