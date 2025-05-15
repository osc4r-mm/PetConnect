// src/services/authService.js
import api from './api';

const authService = {
  // Obtiene la cookie CSRF de Sanctum (ruta sin /api)
  getCsrfCookie: () => {
    const base = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/api$/, '');
    return fetch(`${base}/sanctum/csrf-cookie`, {
      credentials: 'include'
    });
  },

  login: async creds => {
    // 1) Pido la cookie CSRF
    await authService.getCsrfCookie();

    // 2) Hago login con axios (que ya envía cookies)
    const { data } = await api.post('/login', creds);
    return data;
  },

  register: async info => {
    // 1) Pido la cookie CSRF
    await authService.getCsrfCookie();

    // 2) Registro
    const { data } = await api.post('/register', info);
    return data;
  },

  fetchUser: () => api.get('/user').then(res => res.data),

  logout: () => api.post('/logout'),
};

export default authService;
