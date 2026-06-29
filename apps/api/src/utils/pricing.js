// Single source of truth for price math. sellingPrice = MRP - discount.
function calculatePrice({ mrp, discountType = 'NONE', discountPercent = 0, discountAmount = 0 }) {
  let selling = mrp;
  if (discountType === 'PERCENT') selling = mrp - (mrp * discountPercent) / 100;
  else if (discountType === 'AMOUNT') selling = mrp - discountAmount;
  selling = Math.max(0, Math.round(selling));
  const savedPercent = mrp > 0 ? Math.round(((mrp - selling) / mrp) * 100) : 0;
  return {
    mrp,
    sellingPrice: selling,
    discountAmount: mrp - selling,
    savedPercent,
  };
}
module.exports = { calculatePrice };
