import api from './api';


// Obtener mascotas con filtros opcionales
export const getPets = async (page = 1, filters = {}) => {
  try {
    const response = await api.get('/pets', { params: { page, ...filters } });
    return response.data;
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    throw error;
  }
};

// Obtener una mascota por su ID
export const getPet = async (id) => {
  try {
    const response = await api.get(`/pet/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener mascota con ID ${id}:`, error);
    throw error;
  }
};

// Obtener el dueño de una mascota
export const getOwner = async (id) => {
  try {
    const response = await api.get(`/pet/${id}/owner`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener dueño con ID ${id}:`, error);
    throw error;
  }
};

// Crear una nueva mascota
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
  
  try {
    const response = await api.post('/pet', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear mascota:', error);
    throw error;
  }
};

// Actualizar una mascota existente
export const updatePet = async (id, petData) => {
  const formData = new FormData();
  
  // Añadir método PUT a través de _method para Laravel
  formData.append('_method', 'PUT');
  
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
  
  try {
    const response = await api.post(`/pet/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar mascota con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar una mascota
export const deletePet = async (id) => {
  try {
    const response = await api.delete(`/pet/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar mascota con ID ${id}:`, error);
    throw error;
  }
};

// Hacer una solicitud
export const request = async (petId, formData) => {
  const response = await api.post(`/pet/${petId}/request`, formData);
  return response.data;
};

// Obtener datos para formularios de selección
export const getSpecies = async () => {
  try {
    const response = await api.get('/species');
    return response.data;
  } catch (error) {
    console.error('Error al obtener especies:', error);
    return [];
  }
};

export const getBreeds = async () => {
  try {
    const response = await api.get('/breeds');
    return response.data;
  } catch (error) {
    console.error('Error al obtener razas:', error);
    return [];
  }
};

export const getGenders = async () => {
  try {
    const response = await api.get('/genders');
    return response.data;
  } catch (error) {
    console.error('Error al obtener géneros:', error);
    return [];
  }
};

export const getSizes = async () => {
  try {
    const response = await api.get('/sizes');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tamaños:', error);
    return [];
  }
};

export const getActivityLevels = async () => {
  try {
    const response = await api.get('/activity-levels');
    return response.data;
  } catch (error) {
    console.error('Error al obtener niveles de actividad:', error);
    return [];
  }
};

export const getNoiseLevels = async () => {
  try {
    const response = await api.get('/noise-levels');
    return response.data;
  } catch (error) {
    console.error('Error al obtener niveles de ruido:', error);
    return [];
  }
};