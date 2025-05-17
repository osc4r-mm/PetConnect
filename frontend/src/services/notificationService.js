import api from './api';

// Obtener todas las notificaciones (tanto de entrada como de salida)
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
};

// Obtener notificaciones entrantes (donde el usuario es el receptor)
export const getIncomingNotifications = async () => {
  try {
    const response = await api.get('/notifications/incoming');
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones entrantes:', error);
    throw error;
  }
};

// Obtener notificaciones salientes (donde el usuario es el remitente)
export const getOutgoingNotifications = async () => {
  try {
    const response = await api.get('/notifications/outgoing');
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones salientes:', error);
    throw error;
  }
};

// Marcar una notificación como leída
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};