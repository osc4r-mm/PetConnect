import api from './api';

export const getAllPets = async () => {
  const response = await api.get('/pets');
  return response.data;
};

export const getPetById = async (id) => {
  const response = await api.get(`/pet/${id}`);
  return response.data;
};
