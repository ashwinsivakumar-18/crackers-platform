const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { Product, Category, User, Review } = require('../src/models');
const { slugify } = require('../src/utils/ids');

const MASTER = [
  { category: 'One Sound Crackers', name: '4" Lakshmi – 10 packets – Bundle', offer: 300, sku: 'OSC-001', aliases: ['4" Lakshmi'], description: 'Bundle of 10 packets. Effective price: ₹30 per packet.' },
  { category: 'One Sound Crackers', name: '3½" Lakshmi – 15 packets – Bundle', offer: 300, sku: 'OSC-002', aliases: ['3 1/2" Lakshmi'], description: 'Bundle of 15 packets. Effective price: ₹20 per packet.' },
  { category: 'One Sound Crackers', name: '4" Gold Lakshmi', offer: 40, sku: 'OSC-003' },
  { category: 'One Sound Crackers', name: '5" Jallikattu', offer: 60, sku: 'OSC-004' },
  { category: 'One Sound Crackers', name: '6" Lion', offer: 80, sku: 'OSC-005' },
  { category: 'One Sound Crackers', name: '2¾" Kuruvi', offer: 10, sku: 'OSC-006', aliases: ['2 3/4" Kuruvi'] },

  { category: 'Flower Pot', name: 'Flower Pot Big', offer: 100, sku: 'FP-001' },
  { category: 'Flower Pot', name: 'Flower Pot Special', offer: 140, sku: 'FP-002' },
  { category: 'Flower Pot', name: 'Flower Pot Asoka', offer: 245, sku: 'FP-003', aliases: ['Flower Pot Ashoka'] },
  { category: 'Flower Pot', name: 'Flower Pot Giant', offer: 360, sku: 'FP-004', aliases: ['Flower Pot Gaint'] },
  { category: 'Flower Pot', name: 'Colour Koti', offer: 450, sku: 'FP-005' },

  { category: 'Ground Chakkar', name: 'Ground Chakkar Big', offer: 60, sku: 'GC-001' },
  { category: 'Ground Chakkar', name: 'Ground Chakkar Special', offer: 120, sku: 'GC-002' },
  { category: 'Ground Chakkar', name: 'Ground Chakkar Deluxe', offer: 180, sku: 'GC-003' },
  { category: 'Ground Chakkar', name: 'Ground Chakkar Super Deluxe', offer: 340, sku: 'GC-004' },
  { category: 'Ground Chakkar', name: 'Wire Chakkar', offer: 250, sku: 'GC-005' },
  { category: 'Ground Chakkar', name: 'Ground Chakkar Ashoka', offer: 150, sku: 'GC-006' },

  { category: 'Twinkling Star', name: '1½ ft Twinkling Star', offer: 40, sku: 'TS-001', aliases: ['1 1/2" Twinkling Star'] },
  { category: 'Twinkling Star', name: '4 ft Twinkling Star', offer: 120, sku: 'TS-002', aliases: ['4" Twinkling Star'] },

  { category: 'Rocket Crackers', name: 'Baby Rocket', offer: 60, sku: 'RC-001' },
  { category: 'Rocket Crackers', name: 'Rocket Bomb', offer: 120, sku: 'RC-002' },
  { category: 'Rocket Crackers', name: 'Whistling Rockets', offer: 300, sku: 'RC-003', pack: 'Pack of 10 pieces.' },
  { category: 'Rocket Crackers', name: '3 Sound Rocket', offer: 250, sku: 'RC-004', pack: 'Pack of 10 pieces.' },
  { category: 'Rocket Crackers', name: 'Ferrari Rocket', offer: 250, sku: 'RC-005', pack: 'Pack of 5 pieces.' },

  { category: 'Deluxe Crackers', name: '28 Chorsa', offer: 25, sku: 'DC-001' },
  { category: 'Deluxe Crackers', name: '24 Deluxe', offer: 65, sku: 'DC-002' },
  { category: 'Deluxe Crackers', name: '50 Deluxe', offer: 150, sku: 'DC-003' },
  { category: 'Deluxe Crackers', name: '100 Deluxe', offer: 250, sku: 'DC-004' },

  { category: 'Wala Crackers', name: '100 Wala', offer: 70, sku: 'WC-001' },
  { category: 'Wala Crackers', name: '1000 Wala', offer: 380, sku: 'WC-002' },
  { category: 'Wala Crackers', name: '2000 Wala', offer: 700, sku: 'WC-003' },
  { category: 'Wala Crackers', name: '5000 Wala', offer: 1750, sku: 'WC-004' },
  { category: 'Wala Crackers', name: '10000 Wala', offer: 2900, sku: 'WC-005' },

  { category: 'Peacock Crackers', name: 'Mini Peacock', offer: 180, sku: 'PC-001' },
  { category: 'Peacock Crackers', name: 'Peacock Colour 3 in 1', offer: 260, sku: 'PC-002' },
  { category: 'Peacock Crackers', name: 'Bada Peacock', offer: 650, sku: 'PC-003' },

  { category: 'Arial Colour Shot', name: 'Chota Fancy 1½"', offer: 60, sku: 'ACS-001' },
  { category: 'Arial Colour Shot', name: '1½" Fancy Arial Shot', offer: 100, sku: 'ACS-002' },
  { category: 'Arial Colour Shot', name: '2" Fancy Arial Shot', offer: 180, sku: 'ACS-003' },
  { category: 'Arial Colour Shot', name: '3½" Fancy Arial Shot', offer: 380, sku: 'ACS-004' },
  { category: 'Arial Colour Shot', name: '4" Fancy Arial Shot', offer: 550, sku: 'ACS-005' },

  { category: 'Multi Colour Shot', name: '15 Multi Colour Shot', offer: 375, sku: 'MCS-001' },
  { category: 'Multi Colour Shot', name: 'Setout', offer: 2800, sku: 'MCS-002' },
  { category: 'Multi Colour Shot', name: '30 Shot', offer: 600, sku: 'MCS-003' },
  { category: 'Multi Colour Shot', name: '60 Shot', offer: 1200, sku: 'MCS-004' },
  { category: 'Multi Colour Shot', name: '120 Shot', offer: 2400, sku: 'MCS-005' },
  { category: 'Multi Colour Shot', name: '240 Shot', offer: 4800, sku: 'MCS-006' },

  { category: 'Raider Colour Arial Shot', name: '7 Shot Arial', offer: 125, sku: 'RAS-001', pack: 'Pack of 5 pieces.' },
  { category: 'Raider Colour Arial Shot', name: '12 Shot Arial', offer: 190, sku: 'RAS-002' },
  { category: 'Raider Colour Arial Shot', name: '25 Shot Arial', offer: 425, sku: 'RAS-003' },

  { category: 'Sparklers', name: '7 cm Electric', offer: 10, sku: 'SP-001' },
  { category: 'Sparklers', name: '7 cm Colour', offer: 12, sku: 'SP-002' },
  { category: 'Sparklers', name: '7 cm Red', offer: 15, sku: 'SP-003' },
  { category: 'Sparklers', name: '7 cm Green', offer: 16, sku: 'SP-004' },
  { category: 'Sparklers', name: '10 cm Electric', offer: 20, sku: 'SP-005' },
  { category: 'Sparklers', name: '10 cm Colour', offer: 25, sku: 'SP-006' },
  { category: 'Sparklers', name: '10 cm Red', offer: 30, sku: 'SP-007' },
  { category: 'Sparklers', name: '10 cm Green', offer: 30, sku: 'SP-008' },
  { category: 'Sparklers', name: '12 cm Electric', offer: 40, sku: 'SP-009' },
  { category: 'Sparklers', name: '15 cm Electric', offer: 75, sku: 'SP-010' },
  { category: 'Sparklers', name: '15 cm Colour', offer: 80, sku: 'SP-011' },
  { category: 'Sparklers', name: '15 cm Red', offer: 90, sku: 'SP-012' },
  { category: 'Sparklers', name: '15 cm Green', offer: 90, sku: 'SP-013' },
  { category: 'Sparklers', name: '30 cm Electric', offer: 75, sku: 'SP-014' },
  { category: 'Sparklers', name: '30 cm Colour', offer: 80, sku: 'SP-015' },
  { category: 'Sparklers', name: '30 cm Red', offer: 90, sku: 'SP-016' },
  { category: 'Sparklers', name: '30 cm Green', offer: 90, sku: 'SP-017' },

  { category: 'Fancy Crackers', name: 'Dora', offer: 80, sku: 'FC-001' },
  { category: 'Fancy Crackers', name: 'Butterfly', offer: 90, sku: 'FC-002' },
  { category: 'Fancy Crackers', name: 'Helicopter', offer: 110, sku: 'FC-003' },
  { category: 'Fancy Crackers', name: 'Bambaram', offer: 120, sku: 'FC-004' },
  { category: 'Fancy Crackers', name: 'Photo Flash Red', offer: 120, sku: 'FC-005' },
  { category: 'Fancy Crackers', name: 'Photo Flash Green', offer: 120, sku: 'FC-006' },
  { category: 'Fancy Crackers', name: 'Photo Flash White', offer: 75, sku: 'FC-007' },
  { category: 'Fancy Crackers', name: 'Bingo Shower', offer: 110, sku: 'FC-008' },
  { category: 'Fancy Crackers', name: 'Selfie Stick 3pcs Multicolour', offer: 85, sku: 'FC-009' },
  { category: 'Fancy Crackers', name: 'Drone', offer: 130, sku: 'FC-010' },
  { category: 'Fancy Crackers', name: 'Assorted Cartoon', offer: 85, sku: 'FC-011' },
  { category: 'Fancy Crackers', name: 'Snake Cartoon', offer: 60, sku: 'FC-012' },
  { category: 'Fancy Crackers', name: 'Siren', offer: 175, sku: 'FC-013' },

  { category: 'Bijili', name: 'Bijili Red 50pc', offer: 20, sku: 'BJ-001' },
  { category: 'Bijili', name: 'Bijili Red 100pcs', offer: 40, sku: 'BJ-002' },
  { category: 'Bijili', name: 'Stripped Bijili 50pcs', offer: 23, sku: 'BJ-003' },
  { category: 'Bijili', name: 'Stripped Bijili 100pcs', offer: 45, sku: 'BJ-004' },

  { category: 'Bomb', name: 'Bullet Bomb', offer: 35, sku: 'BM-001' },
  { category: 'Bomb', name: 'Hydro Bomb', offer: 90, sku: 'BM-002' },
  { category: 'Bomb', name: 'Classic Bomb', offer: 170, sku: 'BM-003' },
  { category: 'Bomb', name: 'DTS', offer: 350, sku: 'BM-004' },
  { category: 'Bomb', name: 'Mega Bomb', offer: 430, sku: 'BM-005' },
];

const norm = (value) => String(value)
  .toLowerCase()
  .replace(/½/g, ' 1/2 ')
  .replace(/¾/g, ' 3/4 ')
  .replace(/["“”″]/g, ' ')
  .replace(/[^​a-z0-9/]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

function priceFor(item) {
  let hash = 0;
  for (const char of item.name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const targetPercent = 50 + (hash % 31);
  const rawMrp = item.offer / (1 - targetPercent / 100);
  const minMrp = item.offer * 2;
  const maxMrp = item.offer * 5;
  const mrp = Math.max(minMrp, Math.min(maxMrp, Math.round(rawMrp / 10) * 10));
  const discountAmount = mrp - item.offer;
  const savedPercent = Math.round(discountAmount / mrp * 100);
  return { mrp, discountAmount, savedPercent };
}

function descriptionFor(item) {
  const variants = [
    `${item.name} is a festive pick from our ${item.category} collection, carefully packed for your celebration.`,
    `Bring more excitement to the occasion with ${item.name}, a popular choice from our ${item.category} range.`,
    `${item.name} is selected for joyful festive moments and supplied as part of our Sivakasi ${item.category} collection.`,
    `Add ${item.name} to your celebration lineup for a lively festive experience. Packed with care for delivery.`,
    `A celebration-ready choice from the ${item.category} range, ${item.name} is carefully checked and packed.`,
  ];
  let hash = 0;
  for (const char of item.name) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return `${variants[hash % variants.length]}${item.pack ? ` ${item.pack}` : ''}`;
}

async function main() {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(env.mongoUri);

  const [products, categories] = await Promise.all([
    Product.find({}).lean(),
    Category.find({}).lean(),
  ]);

  const used = new Set();
  const plan = MASTER.map((item) => {
    const names = [item.name, ...(item.aliases || [])].map(norm);
    const existing = products.find((p) => !used.has(String(p._id)) && names.includes(norm(p.name)));
    if (existing) used.add(String(existing._id));
    return { item, existing, pricing: priceFor(item) };
  });
  const remove = products.filter((p) => !used.has(String(p._id)));

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    add: plan.filter((x) => !x.existing).map((x) => x.item.name),
    update: plan.filter((x) => x.existing).map((x) => `${x.existing.name} -> ${x.item.name}`),
    remove: remove.map((x) => x.name),
    prices: plan.map(({ item, pricing }) => ({ name: item.name, offer: item.offer, mrp: pricing.mrp, discount: `${pricing.savedPercent}%` })),
  }, null, 2));

  if (!apply) return;

  const backupDir = path.resolve(__dirname, '../../../backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `catalog-before-master-sync-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ createdAt: new Date().toISOString(), products, categories }, null, 2));

  const categoryMap = new Map();
  const categoryNames = [...new Set(MASTER.map((x) => x.category))];
  for (let i = 0; i < categoryNames.length; i += 1) {
    const name = categoryNames[i];
    let category = categories.find((c) => norm(c.name) === norm(name));
    if (category) {
      category = await Category.findByIdAndUpdate(category._id, { name, sortOrder: i, isActive: true }, { new: true });
    } else {
      category = await Category.create({ name, slug: slugify(name), sortOrder: i, isActive: true });
    }
    categoryMap.set(name, category);
  }

  for (const { item, existing, pricing } of plan) {
    const update = {
      name: item.name,
      slug: existing?.slug || `${slugify(item.name)}-${Date.now().toString(36)}`,
      sku: existing?.sku || item.sku,
      categoryId: categoryMap.get(item.category)._id,
      description: item.description || existing?.description || descriptionFor(item),
      safetyInstructions: existing?.safetyInstructions,
      mrp: pricing.mrp,
      sellingPrice: item.offer,
      discountType: 'AMOUNT',
      discountPercent: pricing.savedPercent,
      discountAmount: pricing.discountAmount,
      stock: 100,
      images: existing?.images || [],
      costPrice: existing?.costPrice || 0,
      ratingAvg: existing?.ratingAvg || 0,
      reviewCount: existing?.reviewCount || 0,
      isActive: true,
    };
    if (existing) await Product.updateOne({ _id: existing._id }, { $set: update });
    else await Product.create(update);
  }

  const removedIds = remove.map((p) => p._id);
  if (removedIds.length) {
    await Product.deleteMany({ _id: { $in: removedIds } });
    await Promise.all([
      User.updateMany({}, { $pull: { 'wishlists.$[].productIds': { $in: removedIds } } }),
      Review.deleteMany({ productId: { $in: removedIds } }),
    ]);
  }

  const keepCategoryIds = [...categoryMap.values()].map((c) => c._id);
  await Category.deleteMany({ _id: { $nin: keepCategoryIds } });
  console.log(JSON.stringify({ synced: true, total: MASTER.length, backupPath }, null, 2));
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
