import api from './api';

export const getPets = async (page = 1, filters = {}) => {
  const response = await api.get('/pets', { params: { page, ...filters } });
  return response.data;
};

export const getPet = async (id) => {
  const response = await api.get(`/pet/${id}`);
  return response.data;
};

export const getOwner = async (id) => {
  const response = await api.get(`/pet/${id}/owner`);
  return response.data;
};

export const request = async (petId, formData) => {
  const response = await api.post(`/pet/${petId}/request`, formData);
  return response.data;
};

// Pet data
export const getSpecies = async () => {
  const response = await api.get('/species');
  return response.data;
};

export const getBreeds = async () => {
  const response = await api.get('/breeds');
  return response.data;
};

export const getGenders = async () => {
  const response = await api.get('/genders');
  return response.data;
};

export const getSizes = async () => {
  const response = await api.get('/sizes');
  return response.data;
};

export const getActivityLevels = async () => {
  const response = await api.get('/activity-levels');
  return response.data;
};

export const getNoiseLevels = async () => {
  const response = await api.get('/noise-levels');
  return response.data;
};