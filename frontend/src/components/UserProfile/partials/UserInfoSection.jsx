import { useState } from 'react';
import { UserIcon, Camera } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const InfoRow = ({ label, value }) => (
  <div>
    <span className="text-gray-500">{label}:</span> <span className="font-medium">{value}</span>
  </div>
);

const roleColors = {
  admin: 'bg-red-500',
  caregiver: 'bg-green-500',
  user: 'bg-blue-500'
};

export default function UserInfoSection({ user, onUserUpdate }) {
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === user.id;
  const [isUploading, setIsUploading] = useState(false);

  const roleName = user.role?.name || 'user';
  const badgeColor = roleColors[roleName] || roleColors.user;
  
  const handleImageChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    setIsUploading(true);
    
    try {
      const response = await axios.post('/api/user/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.path) {
        // Actualizar la imagen del usuario en el estado
        onUserUpdate({ ...user, image: response.data.path });
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      alert('No se pudo actualizar la imagen de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold flex items-center">
          <UserIcon className="mr-2 text-blue-600" /> Mi Perfil
        </h2>
        <span className={`${badgeColor} text-white px-3 py-1 rounded-full text-sm uppercase`}>{roleName}</span>
      </div>
      <div className="flex flex-col md:flex-row items-center md:items-start">
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={user.image || 'https://via.placeholder.com/150'}
              alt={user.name}
              className="rounded-full w-full h-full object-cover"
            />
          </div>
          
          {isOwnProfile && (
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              {isUploading ? (
                <div className="text-white">Subiendo...</div>
              ) : (
                <>
                  <Camera className="text-white" />
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
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Nombre" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          {isOwnProfile && <InfoRow label="Saldo" value={`${Number(user.wallet_balance) || 0}€`} />}
          {user.gender && <InfoRow label="Género" value={user.gender} />}
          {user.age && <InfoRow label="Edad" value={`${user.age} años`} />}
          {user.description && <InfoRow label="Descripción" value={user.description} />}
        </div>
      </div>
    </section>
  );
}