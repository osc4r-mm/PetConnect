import api from './api';

export default {
  login: async creds => {
    const { data } = await api.post('/login', creds);
    // data.token es el personal access token que te devuelve Laravel
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  },
  
  register: async creds => {
    const { data } = await api.post('/register', creds);
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  },

  logout: async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
  },

  fetchUser: async () => { return api.get('/profile').then(res => res.data); },
}
