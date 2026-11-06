import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  // Pulihkan sesi dari token yang tersimpan
  useEffect(() => {
    if (!tokenStore.get()) return;
    api.get('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  // Dipicu api.js saat server membalas 401 (token kedaluwarsa)
  useEffect(() => {
    const onExpired = () => {
      tokenStore.clear();
      setUser(null);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = async ({ email, password, rememberMe }) => {
    const data = await api.post('/auth/login', { email, password, rememberMe });
    tokenStore.set(data.token, rememberMe);
    setUser(data.user);
  };

  const register = async (form) => {
    const data = await api.post('/auth/register', form);
    tokenStore.set(data.token, false);
    setUser(data.user);
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
