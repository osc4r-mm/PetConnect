import React from 'react';
import { 
  Mars, Venus, Calendar, Clock, 
  VolumeX, Zap, Volume2, Ruler, Weight
} from 'lucide-react';

// Componente reutilizable para características
const CharacteristicItem = ({ icon, title, value }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center mb-3">
      {icon}
      <div className="ml-2">
        <p className="font-medium">{title}</p>
        <p className="text-gray-700">{value}</p>
      </div>
    </div>
  );
};

const PetCharacteristics = ({ pet, formatHelpers }) => {
  const genderIsMale = pet.gender?.name?.toLowerCase() === 'macho';
  
  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <h2 className="text-xl font-semibold mb-4">Características</h2>
      
      <div className="space-y-1">
        <CharacteristicItem
          icon={genderIsMale 
            ? <Mars className="text-blue-500" size={20} />
            : <Venus className="text-pink-500" size={20} />
          }
          title="Género"
          value={pet.gender?.name}
        />
        
        <CharacteristicItem
          icon={<Calendar className="text-orange-500" size={20} />}
          title="Edad"
          value={formatHelpers.age(pet.age)}
        />

        <CharacteristicItem
          icon={<Weight className="text-gray-700" size={20} />} // No hay ícono de balanza en lucide-react
          title="Peso"
          value={`${pet.weight} kg`}
        />
        
        <CharacteristicItem
          icon={<Ruler className="text-purple-500" size={20} />}
          title="Tamaño"
          value={pet.size?.name}
        />
        
        <CharacteristicItem
          icon={<Zap className="text-yellow-500" size={20} />}
          title="Nivel de actividad"
          value={pet.activityLevel?.name}
        />
        
        <CharacteristicItem
          icon={pet.noiseLevel?.id === 1 
            ? <VolumeX className="text-green-500" size={20} />
            : <Volume2 className="text-red-500" size={20} />
          }
          title="Nivel de ruido"
          value={pet.noiseLevel?.name}
        />
        
        <CharacteristicItem
          icon={<Clock className="text-indigo-500" size={20} />}
          title="Fecha de registro"
          value={formatHelpers.date(pet.created_at)}
        />
      </div>
    </div>
  );
};

export default PetCharacteristics;