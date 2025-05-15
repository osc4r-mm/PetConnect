import React from 'react';
import { User, Mail, Award } from 'lucide-react';

export default function PetOwner({ owner }) {
  // Si no hay dueño, no mostramos nada
  if (!owner) {
    return null;
  }

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <User className="mr-2 text-blue-600" size={20} />
        Información del dueño
      </h3>
      
      <div className="flex items-center">
        {/* Imagen de perfil */}
        <div className="mr-4">
          {owner.image ? (
            <img 
              src={owner.image} 
              alt={`${owner.name}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-400">
              <User size={32} className="text-blue-600" />
            </div>
          )}
        </div>
        
        {/* Datos del dueño */}
        <div className="flex-1">
          <h4 className="font-medium text-lg">{owner.name}</h4>
          
          <div className="flex flex-col space-y-1 mt-1">
            <div className="flex items-center text-sm text-gray-600">
              <Mail size={14} className="mr-1 text-blue-500" />
              <span>{owner.email}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Award size={14} className="mr-1 text-blue-500" />
              <span>{owner.role?.name || 'Usuario'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}