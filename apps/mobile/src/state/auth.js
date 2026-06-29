import React, { createContext, useContext, useState } from 'react';
import { api, tokenStore } from '../api';
const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(!!tokenStore.getAccess());
  const value = {
    user, authed,
    async requestOtp(mobile) { try { await api.auth.requestOtp(mobile, 'REGISTER'); return 'REGISTER'; } catch { await api.auth.requestOtp(mobile, 'LOGIN'); return 'LOGIN'; } },
    async verifyOtp(mobile, code, purpose, name) { const r = await api.auth.verifyOtp(mobile, code, { purpose, name }); setUser(r.user); setAuthed(true); return r; },
    async logout() { await api.auth.logout(); setUser(null); setAuthed(false); },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
