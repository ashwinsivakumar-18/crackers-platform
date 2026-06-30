import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const Ctx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    api.auth.me().then((r) => setUser(r.user)).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);
  const value = {
    user, ready, setUser,
    refresh: async () => { try { const r = await api.auth.me(); setUser(r.user); } catch { setUser(null); } },
    logout: async () => { try { await api.auth.logout(); } finally { setUser(null); } },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
