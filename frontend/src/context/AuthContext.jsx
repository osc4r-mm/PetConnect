import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, intentamos obtener el usuario activo
  useEffect(() => {
    authService.fetchUser()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const u = await authService.register(data);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

