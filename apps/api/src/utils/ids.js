// ORD-YYYYMMDD-NNNNNN
function generateOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const n = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  return `ORD-${ymd}-${n}`;
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
module.exports = { generateOrderNumber, slugify };
