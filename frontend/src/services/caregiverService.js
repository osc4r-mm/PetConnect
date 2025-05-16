import api from './api';

// Convertirse en cuidador
export const becomeCaregiver = async (userId) => {
  try {
    const response = await api.post(`/caregivers/${userId}/become`);
    return response.data;
  } catch (error) {
    console.error('Error al convertirse en cuidador:', error);
    throw error;
  }
};

// Darse de baja como cuidador (vuelve a rol de usuario)
export const quitCaregiver = async (userId) => {
  try {
    const response = await api.post(`/caregivers/${userId}/quit`);
    return response.data;
  } catch (error) {
    console.error('Error al darse de baja como cuidador:', error);
    throw error;
  }
};

// Verificar si un usuario es cuidador
export const isCaregiver = (user) => {
  return user && user.role?.name === 'caregiver';
};

// Obtener cuidadores disponibles por horario
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