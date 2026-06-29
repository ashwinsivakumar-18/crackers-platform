export const rupee = (n) =>
'₹' + Number(n ?? 0).toLocaleString('en-IN');

// Festive gradient seed per product (no image yet) — mirrors the demo look.
export const hueFor = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = h * 31 + id.charCodeAt(i) >>> 0;
  return h % 360;
};