import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { getUserImageUrl } from '../../../services/userService';

const OwnerCard = ({ owner }) => {
  if (!owner) return null;
  
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm p-2 hover:scale-105 transition-transform duration-200 cursor-pointer">
      {/* Foto de perfil */}
      <div className="flex-shrink-0 mr-3">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
          {owner.image ? (
            <img src={getUserImageUrl(owner.image)} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">🐶</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Información del dueño */}
      <div className="flex-1 min-w-0">
        <Link to={`/user/${owner.id}`}>
          <h3 className="text-sm font-medium text-gray-900 truncate">{owner.name}</h3>
        </Link>
        <p className="text-xs text-gray-500 truncate">
          {owner.email}
        </p>
      </div>
      
      {/* Botón de contacto */}
      <div className="ml-2">
        <Link 
          to={`mailto:${owner.email}`}
          className="inline-flex items-center p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          <Mail size={16} />
        </Link>
      </div>
    </div>
  );
};

export default OwnerCard;