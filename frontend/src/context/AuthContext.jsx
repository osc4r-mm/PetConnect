import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, revisamos si hay sesión guardada
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (!stored) {
      setLoading(false);
      return;
    }

    const { token, user, expiresAt } = JSON.parse(stored);
    const now = Date.now();

    if (now > expiresAt) {
      localStorage.removeItem('auth');
      setLoading(false);
      return;
    }

    // Renovar expiración
    const newExpiresAt = now + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('auth', JSON.stringify({ token, user, expiresAt: newExpiresAt }));

    // Configurar token en axios
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const token = data.token;
    const user = data.user;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    // Guardar sesión en localStorage
    localStorage.setItem('auth', JSON.stringify({ token, user, expiresAt }));

    // Añadir token a axios
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const user = await authService.register(data);
    return login({ email: data.email, password: data.password }); // opcional: auto-login
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
