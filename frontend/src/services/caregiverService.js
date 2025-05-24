import api from './api';

// convertirse en cuidador (usuario solicita el rol de cuidador)
export const becomeCaregiver = async (userId) => {
  try {
    const response = await api.post(`/caregivers/${userId}/become`);
    return response.data;
  } catch (error) {
    console.error('Error al convertirse en cuidador:', error);
    throw error;
  }
};

// darse de baja como cuidador (volver al rol de usuario)
export const quitCaregiver = async (userId) => {
  try {
    const response = await api.post(`/caregivers/${userId}/quit`);
    return response.data;
  } catch (error) {
    console.error('Error al darse de baja como cuidador:', error);
    throw error;
  }
};

// comprobar si un usuario es cuidador
export const isCaregiver = (user) => {
  return user && user.role?.name === 'caregiver';
};

// obtener cuidadores disponibles por fecha y ubicación
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