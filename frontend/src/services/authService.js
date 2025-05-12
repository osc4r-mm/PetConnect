// src/services/authService.js
import api from './api';

export default {
  setToken: token => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  login: async creds => {
    const { data } = await api.post('/login', creds);
    return data;
  },
  register: async info => {
    const { data } = await api.post('/register', info);
  },
  fetchUser: () => {
    return api.get('/user').then(res => res.data);
  },
  logout: () => api.post('/logout'),
};
