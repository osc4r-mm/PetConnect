import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { getUserImageUrl } from '../../../services/userService';

const OwnerCard = ({ owner }) => {
  // Si no hay datos del dueño, no renderizar nada
  if (!owner) return null;
  
  return (
    <div className="flex items-center bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-xl shadow p-3 hover:scale-105 transition-transform duration-200 cursor-pointer">
      <div className="flex-shrink-0 mr-3">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-green-200">
            <img src={getUserImageUrl(owner.image)} alt="Perfil" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <Link to={`/user/${owner.id}`}>
          <h3 className="text-md font-bold text-green-700 truncate">{owner.name}</h3>
        </Link>
        <p className="text-xs text-gray-500 truncate">
          {owner.email}
        </p>
      </div>
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