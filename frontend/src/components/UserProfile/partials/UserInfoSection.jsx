import React, { useState } from 'react';
import { Mail, Camera, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { updateUser } from '../../../services/userService';
import { becomeCaregiver, quitCaregiver, isCaregiver} from '../../../services/caregiverService';

const UserInfoSection = ({ user }) => {
  const { user: currentUser, updateUserData } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isOwnProfile = currentUser && user.id === currentUser.id;
  
  // Verificar si el usuario es cuidador
  const userIsCaregiver = isCaregiver(user);

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
      const response = await updateUser(user.id, file);
      
      if (response && response.path) {
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
  
  // Convertirse en cuidador
  const handleBecomeCaregiver = async () => {
    setIsProcessing(true);
    try {
      const result = await becomeCaregiver();
      if (result && result.user) {
        updateUserData(result.user);
      }
    } catch (error) {
      console.error('Error al convertirse en cuidador:', error);
      alert('No se pudo convertir en cuidador');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Darse de baja como cuidador
  const handleQuitCaregiver = async () => {
    if (window.confirm('¿Estás seguro de que quieres dejar de ser cuidador?')) {
      setIsProcessing(true);
      try {
        const result = await quitCaregiver();
        if (result && result.user) {
          updateUserData(result.user);
        }
      } catch (error) {
        console.error('Error al darse de baja como cuidador:', error);
        alert('No se pudo dar de baja como cuidador');
      } finally {
        setIsProcessing(false);
      }
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
        
        {/* Mostrar rol */}
        {user.role?.name && (
          <div className="mt-2 flex flex-col items-center">
            <span className={`${getRoleBadgeColor(user.role.name)} text-white text-sm px-3 py-1 rounded-full`}>
              {user.role.name}
            </span>
            
            {/* Botones de acción para el propio perfil */}
            {isOwnProfile && (
              <div className="mt-4 space-y-2 w-full">
                {/* Si no es cuidador, mostrar botón para convertirse en cuidador */}
                {!userIsCaregiver && (
                  <button
                    onClick={handleBecomeCaregiver}
                    disabled={isProcessing}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    {isProcessing ? 'Procesando...' : 'Hacerse cuidador'}
                  </button>
                )}
                
                {/* Si es cuidador, mostrar botón para darse de baja */}
                {userIsCaregiver && (
                  <button
                    onClick={handleQuitCaregiver}
                    disabled={isProcessing}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
                  >
                    <UserMinus size={18} />
                    {isProcessing ? 'Procesando...' : 'Darse de baja como cuidador'}
                  </button>
                )}
              </div>
            )}
          </div>
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