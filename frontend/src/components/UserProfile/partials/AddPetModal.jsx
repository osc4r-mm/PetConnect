import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddPetModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [profilePath, setProfilePath] = useState('');

  const handleSubmit = () => {
    const newPet = { id: Date.now(), name, profile_path: profilePath, photos: [] };
    onAdd(newPet);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold mb-4">Añadir mascota</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre de la mascota"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border p-2 rounded-md"
          />
          <input
            type="text"
            placeholder="URL de la imagen"
            value={profilePath}
            onChange={e => setProfilePath(e.target.value)}
            className="w-full border p-2 rounded-md"
          />
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-100">Cancelar</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Añadir</button>
          </div>
        </div>
      </div>
    </div>
  );
}