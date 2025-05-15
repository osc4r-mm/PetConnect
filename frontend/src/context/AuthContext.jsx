// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, intentamos recuperar sesión
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('auth') || 'null');
    if (!stored) {
      setLoading(false);
      return;
    }

    const { token, user, expiresAt } = stored;
    if (Date.now() > expiresAt) {
      localStorage.removeItem('auth');
      setLoading(false);
      return;
    }

    // Renovamos expiración
    const newExpiresAt = Date.now() + 7*24*60*60*1000;
    localStorage.setItem('auth', JSON.stringify({ token, user, expiresAt: newExpiresAt }));

    // Inyectamos el token en axios
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    setLoading(false);
  }, []);

  const login = async credentials => {
    const { token, user } = await authService.login(credentials);
    const expiresAt = Date.now() + 7*24*60*60*1000;

    localStorage.setItem('auth', JSON.stringify({ token, user, expiresAt }));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const register = async data => {
    const { token, user } = await authService.register(data);
    const expiresAt = Date.now() + 7*24*60*60*1000;

    localStorage.setItem('auth', JSON.stringify({ token, user, expiresAt }));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('auth');
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
