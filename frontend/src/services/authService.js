import api from './api';

// Iniciar sesión
export const login = async (creds) => {
  const { data } = await api.post('/login', creds);
  // data.token es el personal access token que te devuelve Laravel
  localStorage.setItem('token', data.token);
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  return data;
};

// Registrar usuario
export const register = async (creds) => {
  const { data } = await api.post('/register', creds);
  localStorage.setItem('token', data.token);
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  return data;
};

// Cerrar sesión
export const logout = async () => {
  await api.post('/logout');
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

// Obtener datos del usuario autenticado
export const fetchUser = async () => {
  const res = await api.get('/profile');
  return res.data;
};