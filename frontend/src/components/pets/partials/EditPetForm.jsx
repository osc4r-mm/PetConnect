import React, { useState, useEffect } from 'react';
import {
  updatePet,
  getSpecies,
  getBreeds,
  getGenders,
  getSizes,
  getActivityLevels,
  getNoiseLevels,
} from '../../../services/petService';

const EditPetForm = ({ pet, onUpdated, onCancel }) => {
  const [form, setForm] = useState({
    name: pet.name || '',
    age: pet.age || '',
    gender_id: pet.gender?.id || '',
    weight: pet.weight || '',
    description: pet.description || '',
    for_adoption: !!pet.for_adoption,
    for_sitting: !!pet.for_sitting,
    species_id: pet.species?.id || '',
    breed_id: pet.breed?.id || '',
    size_id: pet.size?.id || '',
    activity_level_id: pet.activity_level?.id || '',
    noise_level_id: pet.noise_level?.id || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [speciesList, setSpeciesList] = useState([]);
  const [breedList, setBreedList] = useState([]);
  const [genderList, setGenderList] = useState([]);
  const [sizeList, setSizeList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [noiseList, setNoiseList] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [species, breeds, genders, sizes, activities, noises] = await Promise.all([
          getSpecies(),
          getBreeds(),
          getGenders(),
          getSizes(),
          getActivityLevels(),
          getNoiseLevels()
        ]);
        
        setSpeciesList(species);
        setBreedList(breeds);
        setGenderList(genders);
        setSizeList(sizes);
        setActivityList(activities);
        setNoiseList(noises);
      } catch (error) {
        setError('Error cargando datos del formulario');
      }
    };
    
    loadData();
  }, []);

  const filteredBreeds = form.species_id
    ? breedList.filter(b => b.species_id === Number(form.species_id))
    : breedList;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (name === 'species_id') {
      setForm(f => ({ ...f, breed_id: '' }));
    }
  };

  /**
   * VERSIÓN SIMPLIFICADA: El backend ya nos devuelve la mascota completa
   * con todas las relaciones, así que solo necesitamos pasarla directamente
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const response = await updatePet(pet.id, form);
      
      // El backend devuelve { message, pet } donde pet ya tiene todas las relaciones
      if (response && response.pet) {
        onUpdated(response.pet); // ¡Así de simple!
      }
    } catch (err) {
      setError('Error actualizando mascota');
    } finally {
      setSaving(false);
    }
  };

  // ... resto del JSX igual que antes
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-100 shadow">
      <h3 className="text-2xl font-bold text-green-700 mb-4">Editar mascota</h3>
      <div>
        <label className="block text-sm font-medium text-green-700">Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-green-700">Edad</label>
        <input name="age" type="number" value={form.age} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white" min="0" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-green-700">Peso (kg)</label>
        <input name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white" min="0" required />
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="flex-1 mb-4 md:mb-0">
          <label className="block text-sm font-medium text-green-700">Género</label>
          <select name="gender_id" value={form.gender_id} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white" required>
            <option value="">Selecciona</option>
            {genderList.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-green-700">Especie</label>
          <select name="species_id" value={form.species_id} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white" required>
            <option value="">Selecciona</option>
            {speciesList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="flex-1 mb-4 md:mb-0">
          <label className="block text-sm font-medium text-green-700">Raza</label>
          <select name="breed_id" value={form.breed_id} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white">
            <option value="">Sin especificar</option>
            {filteredBreeds.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-green-700">Tamaño</label>
          <select name="size_id" value={form.size_id} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white">
            <option value="">Sin especificar</option>
            {sizeList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="flex-1 mb-4 md:mb-0">
          <label className="block text-sm font-medium text-green-700">Nivel de actividad</label>
          <select name="activity_level_id" value={form.activity_level_id} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white">
            <option value="">Sin especificar</option>
            {activityList.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-green-700">Nivel de ruido</label>
          <select name="noise_level_id" value={form.noise_level_id} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white">
            <option value="">Sin especificar</option>
            {noiseList.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-green-700">Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full border border-green-200 rounded p-2 bg-white" />
      </div>
      <div className="flex space-x-6">
        <label className="text-green-700">
          <input type="checkbox" name="for_adoption" checked={form.for_adoption} onChange={handleChange} />
          <span className="ml-2">Disponible para adopción</span>
        </label>
        <label className="text-green-700">
          <input type="checkbox" name="for_sitting" checked={form.for_sitting} onChange={handleChange} />
          <span className="ml-2">Disponible para cuidado</span>
        </label>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <div className="flex space-x-3 pt-2">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default EditPetForm;