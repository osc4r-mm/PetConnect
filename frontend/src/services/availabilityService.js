import api from './api';

// obtener la disponibilidad de un cuidador por su id
export const getAvailability = async (userId) => {
  try {
    const response = await api.get(`/caregiver/${userId}/availability`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    throw error;
  }
};

// obtener la disponibilidad del cuidador autenticado
export const getMyAvailability = async () => {
  try {
    const response = await api.get('/caregiver/availability');
    return response.data;
  } catch (error) {
    console.error('Error al obtener disponibilidad propia:', error);
    throw error;
  }
};

// guardar o actualizar los slots de disponibilidad de un cuidador
export const saveAvailability = async (userId, slots) => {
  try {
    const response = await api.put(`/caregiver/${userId}/availability`, { slots });
    return response.data;
  } catch (error) {
    console.error('Error al guardar disponibilidad:', error);
    throw error;
  }
};

// eliminar uno o varios slots de disponibilidad de un cuidador
export const deleteAvailability = async (userId, slots) => {
  try {
    const response = await api.delete(`/caregiver/${userId}/availability`, { data: { slots } });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error);
    throw error;
  }
};