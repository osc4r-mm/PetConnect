import React, { useState } from 'react';
import { Mail, Camera } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { uploadUserProfileImage } from '../../../services/userService';

const UserInfoSection = ({ user }) => {
  const { user: currentUser, updateUserData } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
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
      const response = await uploadUserProfileImage(user.id, file);
      
      if (response && response.path) {
        // Actualizar el usuario en el contexto
        if (updateUserData) {
          updateUserData({
            ...user,
            image: response.path
          });
        }
      }
    } catch (error) {
      console.error('Error al subir la imagen de perfil:', error);
      alert('No se pudo actualizar la imagen de perfil');
    } finally {
      setIsUploading(false);
    }
  };

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
        {user.role?.name && (
          <span className={`${getRoleBadgeColor(user.role.name)} text-white text-sm px-3 py-1 rounded-full mt-2`}>
            {user.role.name}
          </span>
        )}
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
    </div>
  );
};

export default UserInfoSection;