import React, { createContext, useContext, useState } from 'react';
import { api, tokenStore } from '../api';

const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(!!tokenStore.getAccess());
  const value = {
    user, authed,
    async signIn(identifier, password) { const r = await api.auth.login(identifier, password); setUser(r.user); setAuthed(true); return r; },
    async signUp(payload) { const r = await api.auth.register(payload); setUser(r.user); setAuthed(true); return r; },
    forgotVerify: (mobile, email) => api.auth.forgotVerify(mobile, email),
    forgotReset: (mobile, email, newPassword) => api.auth.forgotReset(mobile, email, newPassword),
    async logout() { await api.auth.logout(); setUser(null); setAuthed(false); },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
