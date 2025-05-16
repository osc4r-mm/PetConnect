import api from './api';

export const getPets = async (page = 1, filters = {}) => {
  const response = await api.get('/pets', { params: { page, ...filters } });
  return response.data;
};

export const getPet = async (petId) => {
  const response = await api.get(`/pet/${petId}`);
  return response.data;
};

export const getOwner = async (petpetId) => {
  const response = await api.get(`/pet/${petId}/owner`);
  return response.data;
};

export const request = async (petId, formData) => {
  const response = await api.post(`/pet/${petId}/request`, formData);
  return response.data;
};

export const createPet = async (petData) => {
  const formData = new FormData();
  
  // Añadir campos de texto al FormData
  Object.keys(petData).forEach(key => {
    if (key !== 'profile_image' && key !== 'additional_photos') {
      formData.append(key, petData[key]);
    }
  });
  
  // Añadir la imagen de perfil si existe
  if (petData.profile_image) {
    formData.append('profile_image', petData.profile_image);
  }
  
  // Añadir fotos adicionales si existen
  if (petData.additional_photos && petData.additional_photos.length > 0) {
    petData.additional_photos.forEach(photo => {
      formData.append('additional_photos[]', photo);
    });
  }
  
  const response = await api.post('/pets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updatePet = async (petId, petData) => {
  const formData = new FormData();
  
  // Añadir campos de texto al FormData
  Object.keys(petData).forEach(key => {
    if (key !== 'profile_image' && key !== 'additional_photos') {
      formData.append(key, petData[key]);
    }
  });
  
  // Añadir la imagen de perfil si existe
  if (petData.profile_image) {
    formData.append('profile_image', petData.profile_image);
  }
  
  // Añadir fotos adicionales si existen
  if (petData.additional_photos && petData.additional_photos.length > 0) {
    petData.additional_photos.forEach(photo => {
      formData.append('additional_photos[]', photo);
    });
  }
  
  const response = await api.post(`/pet/${petId}?_method=PUT`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deletePet = async (petId) => {
  const response = await api.delete(`/pet/${petId}`);
  return response.data;
};

// Pet data
export const getSpecies = async () => {
  const response = await api.get('/species');
  return response.data;
};

export const getBreeds = async () => {
  const response = await api.get('/breeds');
  return response.data;
};

export const getGenders = async () => {
  const response = await api.get('/genders');
  return response.data;
};

export const getSizes = async () => {
  const response = await api.get('/sizes');
  return response.data;
};

export const getActivityLevels = async () => {
  const response = await api.get('/activity-levels');
  return response.data;
};

export const getNoiseLevels = async () => {
  const response = await api.get('/noise-levels');
  return response.data;
};