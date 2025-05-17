import api from './api';

// Obtener disponibilidad del cuidador
export const getAvailability = async (userId) => {
  try {
    const response = await api.get(`/caregivers/${userId}/availability`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    throw error;
  }
};

// Guardar slots de disponibilidad
export const saveAvailability = async (slots) => {
  try {
    const response = await api.post('/caregivers/availability', { slots });
    return response.data;
  } catch (error) {
    console.error('Error al guardar disponibilidad:', error);
    throw error;
  }
};

// Eliminar slots de disponibilidad
export const deleteAvailability = async (slots) => {
  try {
    const response = await api.delete('/caregivers/availability', { data: { slots } });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error);
    throw error;
  }
};