import api from './api';

// subir imagen de miniatura para una mascota
export const uploadPetThumbnail = async (petId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('pet_id', petId);
  
  try {
    const response = await api.post('/pet/upload-thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al subir la imagen de miniatura:', error);
    throw error;
  }
};

// subir foto adicional para una mascota
export const uploadPetExtraPhoto = async (petId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await api.post(`/pet/${petId}/upload-extra-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al subir foto adicional:', error);
    throw error;
  }
};

// eliminar una foto de mascota por id de foto
export const deletePetPhoto = async (photoId) => {
  try {
    const response = await api.delete(`/pet-photos/${photoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la foto:', error);
    throw error;
  }
};