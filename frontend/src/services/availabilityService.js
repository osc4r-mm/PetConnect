import api from './api';

// Obtener disponibilidad del cuidador
export const getAvailability = async (userId) => {
  try {
    const response = await api.get(`/caregiver/${userId}/availability`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    throw error;
  }
};

// Obtener la disponibilidad del usuario autenticado (cuidador)
export const getMyAvailability = async () => {
  try {
    const response = await api.get('/caregiver/availability');
    return response.data;
  } catch (error) {
    console.error('Error al obtener disponibilidad propia:', error);
    throw error;
  }
};

// Guardar o actualizar slots de disponibilidad
export const saveAvailability = async (userId, slots) => {
  try {
    const response = await api.put(`/caregiver/${userId}/availability`, { slots });
    return response.data;
  } catch (error) {
    console.error('Error al guardar disponibilidad:', error);
    throw error;
  }
};

// Eliminar slots de disponibilidad
export const deleteAvailability = async (userId, slots) => {
  try {
    const response = await api.delete(`/caregiver/${userId}/availability`, { data: { slots } });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error);
    throw error;
  }
};