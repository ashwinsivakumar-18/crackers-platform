import React, { createContext, useContext, useState } from 'react';
import { api, tokenStore } from '../api';

const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(!!tokenStore.getAccess());
  const value = {
    user, authed,
    // Called after the MSG91 widget verifies the OTP and returns an access-token.
    async completeMsg91(accessToken, name) {
      const r = await api.auth.verifyMsg91(accessToken, name);
      setUser(r.user); setAuthed(true); return r;
    },
    async logout() { await api.auth.logout(); setUser(null); setAuthed(false); },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
