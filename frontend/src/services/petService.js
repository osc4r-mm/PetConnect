import api from './api';

export const getPets = async (page = 1, filters = {}) => {
  const response = await api.get('/pets', { params: { page, ...filters } });
  return response.data;
};

export const getPet = async (id) => {
  const response = await api.get(`/pet/${id}`);
  return response.data;
};

// Función para solicitar la adopción de una mascota
export const adoptPet = async (petId, formData) => {
  const response = await api.post(`/pet/${petId}/adopt`, formData);
  return response.data;
};

// Función para solicitar el cuidado de una mascota
export const requestPetSitting = async (petId, formData) => {
  const response = await api.post(`/pet/${petId}/sitting-request`, formData);
  return response.data;
};

// Funciones existentes
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