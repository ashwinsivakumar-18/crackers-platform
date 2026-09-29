require('dotenv').config();
const { connectDB, disconnectDB } = require('../src/lib/db');
const { User, RefreshToken } = require('../src/models');
const { hashPassword } = require('../src/lib/password');

const ALL_PERMS = ['product:create', 'product:update', 'order:read', 'order:update'];

(async () => {
  const mobile = String(process.env.ADMIN_MOBILE || '').replace(/\D/g, '');
  const password = process.env.ADMIN_PASSWORD || '';
  if (!/^\d{10}$/.test(mobile)) throw new Error('ADMIN_MOBILE must contain exactly 10 digits');
  if (password.length < 8) throw new Error('ADMIN_PASSWORD must contain at least 8 characters');

  await connectDB();
  const staff = await User.find({ isStaff: true });
  if (staff.length !== 1) throw new Error(`Expected exactly one staff account, found ${staff.length}`);

  const oldAdmin = staff[0];
  const existing = await User.findOne({ mobile });
  const passwordHash = await hashPassword(password);

  if (existing && String(existing._id) !== String(oldAdmin._id)) {
    existing.isStaff = true;
    existing.role = 'ADMIN';
    existing.permissions = ALL_PERMS;
    existing.passwordHash = passwordHash;
    await existing.save();

    oldAdmin.isStaff = false;
    oldAdmin.role = 'DISABLED';
    oldAdmin.permissions = [];
    oldAdmin.passwordHash = undefined;
    await oldAdmin.save();
    await RefreshToken.deleteMany({ userId: { $in: [oldAdmin._id, existing._id] } });
  } else {
    oldAdmin.mobile = mobile;
    oldAdmin.passwordHash = passwordHash;
    oldAdmin.permissions = ALL_PERMS;
    await oldAdmin.save();
    await RefreshToken.deleteMany({ userId: oldAdmin._id });
  }

  console.log('Admin login updated and existing sessions revoked.');
  await disconnectDB();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
