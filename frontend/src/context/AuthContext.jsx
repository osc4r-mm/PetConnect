import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario del localStorage al inicio
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      if (authData.token && authData.user) {
        api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
        setUser(authData.user);
      }
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = async (credentials) => {
    const response = await api.post('/login', credentials);
    const { token, user } = response.data;
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    
    // Guardar en localStorage
    localStorage.setItem('auth', JSON.stringify({ token, user }));
    
    return user;
  };

  // Función para registrarse
  const register = async (userData) => {
    const response = await api.post('/register', userData);
    const { token, user } = response.data;
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    
    // Guardar en localStorage
    localStorage.setItem('auth', JSON.stringify({ token, user }));
    
    return user;
  };

  // Función para cerrar sesión
  const logout = () => {
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
    localStorage.removeItem('auth');
  };

  // Nueva función para actualizar datos del usuario
  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    
    // Actualizar localStorage
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      localStorage.setItem('auth', JSON.stringify({
        ...authData,
        user: updatedUser
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};