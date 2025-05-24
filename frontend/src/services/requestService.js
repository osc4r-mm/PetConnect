import api from './api';

// obtener todas las solicitudes del usuario autenticado
export const getRequests = async () => {
  const { data } = await api.get('/requests');
  return data;
};

// aceptar una solicitud por id
export const acceptRequest = async (requestId) => {
  const { data } = await api.patch(`/request/${requestId}/accept`);
  return data;
};

// rechazar una solicitud por id
export const rejectRequest = async (requestId) => {
  const { data } = await api.patch(`/request/${requestId}/reject`);
  return data;
};

// cancelar una solicitud por id
export const cancelRequest = async (requestId) => {
  const { data } = await api.delete(`/request/${requestId}/cancel`);
  return data;
};