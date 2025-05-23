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
export const getOwner = async (petId) => {
  try {
    const response = await api.get(`/pet/${petId}/owner`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el dueño de la mascota ${petId}:`, error);
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
  try {
    // Si algún campo opcional es "", conviértelo a null:
    const cleanData = { ...petData };
    ['breed_id', 'size_id', 'activity_level_id', 'noise_level_id'].forEach(field => {
      if (cleanData[field] === "") cleanData[field] = null;
    });

    // Asegúrate de enviar booleanos
    cleanData.for_adoption = !!cleanData.for_adoption;
    cleanData.for_sitting = !!cleanData.for_sitting;

    const response = await api.put(`/pet/${id}`, cleanData); // No Content-Type necesario, axios manda JSON por defecto
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
  const response = await api.post(`/pet/${petId}/request`, { ...formData, pet_id: petId });
  return response.data;
};

// Función para obtener la URL de imagen predeterminada para mascota
export const getDefaultPetImageUrl = () => {
  return `/uploads/default/default_pet.jpg`;
};

// Función para verificar si una URL es válida
export const isValidImageUrl = (url) => {
  if (!url) return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/uploads/')
  );
};

export const getPetImageUrl = (imagePath) => {
  if (!imagePath) return getDefaultPetImageUrl();
  if (isValidImageUrl(imagePath)) return imagePath;
  return `/uploads/${imagePath}`;
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