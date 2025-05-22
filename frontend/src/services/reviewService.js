import api from './api';

export const getReviews = async (userId) => {
  try {
    const response = await api.get(`/caregivers/${userId}/reviews`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo reseñas del cuidador usuario #${userId}:`, error);
    throw error;
  }
};

export const voteReview = async (userId, rating) => {
  try {
    const response = await api.post(`/caregivers/${userId}/reviews`, { rating });
    return response.data;
  } catch (error) {
    console.error(`Error votando reseña del cuidador usuario #${userId}:`, error);
    throw error;
  }
};

export const canBeReviewed = async (userId) => {
  try {
    const response = await api.get(`/caregivers/${userId}/can_be_reviewed`);
    return response.data.canBeReviewedByMe;
  } catch (error) {
    console.error(`Error verificando si se puede reseñar al cuidador usuario #${userId}:`, error);
    throw error;
  }
};