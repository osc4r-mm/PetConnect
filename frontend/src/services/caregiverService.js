import api from './api';

export const becomeCaregiver = async (userId) => {
  try {
    const response = await api.post(`/caregiver/${userId}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error al convertirse en cuidador:', error);
    throw error;
  }
};

export const deactivateCaregiver = async (userId) => {
  try {
    const response = await api.post(`/caregiver/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error('Error al dar de baja como cuidador:', error);
    throw error;
  }
};

export const getCaregiversBySchedule = async (date, location) => {
  try {
    const response = await api.get('/caregivers/available', {
      params: { date, ...location }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener cuidadores disponibles:', error);
    throw error;
  }
};