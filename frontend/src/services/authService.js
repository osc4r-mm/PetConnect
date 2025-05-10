// src/services/authService.js
import api from './api';

export default {
  login: async creds => {
    const { data } = await api.post('/login', creds);
    return data.user;
  },
  register: async info => {
    const { data } = await api.post('/register', info);
    return data.user;
  },
  fetchUser: async () => {
    const { data } = await api.get('/user');
    return data.user;
  },
  logout: () => api.post('/logout'),
};
