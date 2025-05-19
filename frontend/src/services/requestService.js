import api from './api';

export const getRequests = async () => {
  const { data } = await api.get('/requests');
  return data;
};

export const acceptRequest = async (requestId) => {
  const { data } = await api.patch(`/request/${requestId}/accept`);
  return data;
};

export const rejectRequest = async (requestId) => {
  const { data } = await api.patch(`/request/${requestId}/reject`);
  return data;
};

export const cancelRequest = async (id) => {
  const { data } = await api.delete(`/request/${id}/cancel`);
  return data;
};