import api from './api';

export const getUsers = async (page = 1, filters = {}) => {
  const response = await api.get('/users', { params: { page, ...filters } });
  return response.data;
}

export const getUserById = async (id) => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

export const updateUser = async (id, formData) => {
  const response = await api.put(`/user/${id}`, formData);
  return response.data;
};

export const updateUserLocation = async (id, formData) => {
  const response = await api.put(`/user/${id}/location`, formData);
  return response.data;
}

export const deleteUser = async (id) => {
  const response = await api.delete(`/user/${id}`);
  return response.data;
};

export const getUserPets = async (id) => {
  const response = await api.get(`/user/${id}/pets`);
  return response.data;
};