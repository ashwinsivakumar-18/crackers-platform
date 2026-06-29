import React, { createContext, useContext, useMemo, useState } from 'react';
const CartCtx = createContext(null);
const price = (p) => (p.display ? p.display.sellingPrice : p.sellingPrice);
export function CartProvider({ children }) {
  const [map, setMap] = useState({});
  const add = (p) => setMap((m) => ({ ...m, [p.id]: { product: p, quantity: (m[p.id]?.quantity || 0) + 1 } }));
  const remove = (p) => setMap((m) => { const q = (m[p.id]?.quantity || 0) - 1; const next = { ...m }; if (q <= 0) delete next[p.id]; else next[p.id] = { product: p, quantity: q }; return next; });
  const clear = () => setMap({});
  const value = useMemo(() => { const lines = Object.values(map); return { lines, map, count: lines.reduce((s, l) => s + l.quantity, 0), subtotal: lines.reduce((s, l) => s + price(l.product) * l.quantity, 0), quantityOf: (id) => map[id]?.quantity || 0, add, remove, clear }; }, [map]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export const useCart = () => useContext(CartCtx);
