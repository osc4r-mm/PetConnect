import api from './api';

export const getUser = async (id) => {
  try {
    const response = await api.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo usuario #${id}:`, error);
    throw error;
  }
};

export const getReviews = async (caregiverId) => {
  try {
    const response = await api.get(`/caregivers/${caregiverId}/reviews`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo reseñas del cuidador #${caregiverId}:`, error);
    throw error;
  }
};
export const voteReview = async (caregiverId, rating) => {
  try {
    const response = await api.post(`/caregivers/${caregiverId}/reviews`, { rating });
    return response.data;
  } catch (error) {
    console.error(`Error votando reseña del cuidador #${caregiverId}:`, error);
    throw error;
  }
};
export const canBeReviewed = async (caregiverId) => {
  try {
    const response = await api.get(`/caregivers/${caregiverId}/can_be_reviewed`);
    return response.data.canBeReviewedByMe;
  } catch (error) {
    console.error(`Error verificando si se puede reseñar al cuidador #${caregiverId}:`, error);
    throw error;
  }
};