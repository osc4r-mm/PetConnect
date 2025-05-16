import React, { useState } from 'react';
import { Mail, Camera, Heart, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { updateUser } from '../../../services/userService';

const UserInfoSection = ({ user }) => {
  const { user: currentUser, updateUserData } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingCaregiverRequest, setIsProcessingCaregiverRequest] = useState(false);
  
  const isOwnProfile = currentUser && user.id === currentUser.id;

  const getRoleBadgeColor = (roleName) => {
    if (!roleName) return 'bg-gray-500';

    const role = roleName.toLowerCase();
    if (role === 'caregiver') return 'bg-green-500';
    if (role === 'user') return 'bg-blue-500';
    if (role === 'admin') return 'bg-red-500';
    
    return 'bg-gray-500';
  };

  const handleImageChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const updatedUser = await updateUser(user.id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (updatedUser && updateUserData) {
        updateUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error al subir la imagen de perfil:', error);
      alert('No se pudo actualizar la imagen de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBecomeCaregiver = async () => {
    if (!isOwnProfile) return;
    
    setIsProcessingCaregiverRequest(true);
    try {
      const updatedUser = await updateUser(user.id, { 
        becomeCaregiver: true 
      });
      
      if (updatedUser && updateUserData) {
        updateUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error al convertirse en cuidador:', error);
      alert('No se pudo procesar la solicitud para ser cuidador');
    } finally {
      setIsProcessingCaregiverRequest(false);
    }
  };

  const handleDeactivateCaregiver = async () => {
    if (!isOwnProfile) return;
    
    setIsProcessingCaregiverRequest(true);
    try {
      const updatedUser = await updateUser(user.id, { 
        deactivateCaregiver: true 
      });
      
      if (updatedUser && updateUserData) {
        updateUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error al dar de baja como cuidador:', error);
      alert('No se pudo procesar la solicitud para dar de baja como cuidador');
    } finally {
      setIsProcessingCaregiverRequest(false);
    }
  };

  // Verificar si el usuario es un cuidador activo
  const isActiveCaregiver = user.role?.name === 'caregiver' && user.caregiver?.active;
  // Verificar si el usuario es un cuidador inactivo
  const isInactiveCaregiver = user.role?.name === 'caregiver' && !user.caregiver?.active;

  return (
    <div className="p-4">
      <div className="flex flex-col items-center">
        <div className="relative rounded-full overflow-hidden h-32 w-32 mx-auto border-4 border-white shadow-lg">
          <img 
            src={user.image || '/default/default:user.jpg'} 
            alt="Imagen de perfil" 
            className="h-full w-full object-cover"
          />
          
          {isOwnProfile && (
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
              {isUploading ? (
                <div className="text-white">Subiendo...</div>
              ) : (
                <>
                  <Camera className="text-white" size={24} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </>
              )}
            </label>
          )}
        </div>

        <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
        <div className="flex flex-col items-center gap-1">
          {user.role?.name && (
            <span className={`${getRoleBadgeColor(user.role.name)} text-white text-sm px-3 py-1 rounded-full mt-2`}>
              {user.role.name}
            </span>
          )}
          
          {isInactiveCaregiver && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
              Inactivo
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {user.email && (
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-blue-500 mr-2" />
            <span>{user.email}</span>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Sobre mí</h3>
        <p className="text-gray-700">
          {user.description || 'Sin descripción disponible.'}
        </p>
      </div>

      {/* Botones para cuidador */}
      {isOwnProfile && (
        <div className="mt-6 flex justify-center">
          {!user.role || (user.role?.name !== 'caregiver') ? (
            <button
              onClick={handleBecomeCaregiver}
              disabled={isProcessingCaregiverRequest}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="mr-2" size={18} />
              {isProcessingCaregiverRequest ? 'Procesando...' : 'Convertirme en cuidador'}
            </button>
          ) : isActiveCaregiver ? (
            <button
              onClick={handleDeactivateCaregiver}
              disabled={isProcessingCaregiverRequest}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="mr-2" size={18} />
              {isProcessingCaregiverRequest ? 'Procesando...' : 'Dar de baja como cuidador'}
            </button>
          ) : isInactiveCaregiver ? (
            <button
              onClick={handleBecomeCaregiver}
              disabled={isProcessingCaregiverRequest}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="mr-2" size={18} />
              {isProcessingCaregiverRequest ? 'Procesando...' : 'Reactivar como cuidador'}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserInfoSection;