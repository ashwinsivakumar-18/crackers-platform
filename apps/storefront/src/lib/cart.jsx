
import { createContext, useContext, useMemo, useState } from 'react';













const Ctx = createContext(null);

export function CartProvider({ children }) {
  const [map, setMap] = useState({});

  const add = (p) =>
  setMap((m) => ({ ...m, [p.id]: { product: p, quantity: (m[p.id]?.quantity ?? 0) + 1 } }));
  const remove = (p) =>
  setMap((m) => {
    const q = (m[p.id]?.quantity ?? 0) - 1;
    const next = { ...m };
    if (q <= 0) delete next[p.id];else next[p.id] = { product: p, quantity: q };
    return next;
  });
  const clear = () => setMap({});

  const value = useMemo(() => {
    const lines = Object.values(map);
    const price = (p) => p.display?.sellingPrice ?? p.sellingPrice;
    return {
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + price(l.product) * l.quantity, 0),
      quantityOf: (id) => map[id]?.quantity ?? 0,
      add, remove, clear
    };
  }, [map]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used within CartProvider');
  return c;
};