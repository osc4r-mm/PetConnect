import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  withCredentials: true,                // << deberás enviar y recibir cookies
  headers: { 'Content-Type': 'application/json' }
});

export default api;
