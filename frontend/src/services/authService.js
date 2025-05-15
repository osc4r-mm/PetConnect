import api from './api';

export default {
  login: async creds => {
    const { data } = await api.post('/login', creds);
    // data.token es el personal access token que te devuelve Laravel
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  },

  logout: async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
  },

  fetchUser: () => {
    return api.get('/user').then(res => res.data);
  },

  register: async info => {
    const { data } = await api.post('/register', info);
    return data;
  },
};
