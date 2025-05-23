import api from './api';

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const response = await api.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo usuario #${id}:`, error);
    throw error;
  }
};

export const getPetsFromUser = async (id) => {
  try {
    const response = await api.get(`/user/${id}/pets`)
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo las mascotas del usuario #${id}:`, error)
    throw error;
  }
}

export const uploadUserProfileImage = async (userId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await api.post(`/user/${userId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al subir la imagen de perfil:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/user/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error actualizando usuario #${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error eliminando usuario #${id}:`, error);
    throw error;
  }
};


// Verificar si un usuario es cuidador
export const isAdmin = (user) => {
  return user && user.role?.name === 'admin';
};


export const getDefaultUserImageUrl = () =>
  `/uploads/default/default_user.jpg`;

export const isValidImageUrl = (url) => {
  if (!url) return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/uploads/')
  );
};

export const getUserImageUrl = (imagePath) => {
  if (!imagePath) return getDefaultUserImageUrl();
  if (isValidImageUrl(imagePath)) return imagePath;
  return `/uploads/${imagePath}`;
};