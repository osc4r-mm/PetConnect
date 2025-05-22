import React, { useState } from 'react';
import { updatePet } from '../../../services/petService'; // Debes implementar esta función

const EditPetForm = ({ pet, onUpdated, onCancel }) => {
  const [form, setForm] = useState({ 
    name: pet.name || '',
    age: pet.age || '',
    description: pet.description || '',
    for_adoption: pet.for_adoption || false,
    for_sitting: pet.for_sitting || false,
    // ...otros campos que quieras permitir editar
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await updatePet(pet.id, form);
      onUpdated(updated.pet);
    } catch (err) {
      setError('Error actualizando mascota');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-xl">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Edad</label>
        <input name="age" type="number" value={form.age} onChange={handleChange} className="w-full border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" />
      </div>
      <div className="flex space-x-6">
        <label>
          <input type="checkbox" name="for_adoption" checked={form.for_adoption} onChange={handleChange} />
          <span className="ml-2">Disponible para adopción</span>
        </label>
        <label>
          <input type="checkbox" name="for_sitting" checked={form.for_sitting} onChange={handleChange} />
          <span className="ml-2">Disponible para cuidado</span>
        </label>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex space-x-3">
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded" disabled={saving}>
          Guardar
        </button>
        <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default EditPetForm;