import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Check } from 'lucide-react';
import { createPet, getAll as getAllPets, getSpecies, getBreeds, getGenders, getSizes, getActivityLevels, getNoiseLevels } from '../../../services/petService';

export default function AddPetModal({ onClose, onAdd }) {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender_id: '',
    weight: '',
    description: '',
    for_adoption: false,
    for_sitting: false,
    species_id: '',
    breed_id: '',
    size_id: '',
    activity_level_id: '',
    noise_level_id: '',
  });

  // Estado para imágenes
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  // Estados para datos de selección
  const [species, setSpecies] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [genders, setGenders] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [activityLevels, setActivityLevels] = useState([]);
  const [noiseLevels, setNoiseLevels] = useState([]);

  // Estado para manejo de errores y carga
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar modal con animación al montar
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Cargar datos de selección al montar el componente
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const speciesData = await getSpecies();
        const breedsData = await getBreeds();
        const gendersData = await getGenders();
        const sizesData = await getSizes();
        const activityLevelsData = await getActivityLevels();
        const noiseLevelsData = await getNoiseLevels();
        
        setSpecies(speciesData);
        setBreeds(breedsData);
        setGenders(gendersData);
        setSizes(sizesData);
        setActivityLevels(activityLevelsData);
        setNoiseLevels(noiseLevelsData);
      } catch (error) {
        // Silenciar
      }
    };
    
    fetchSelectData();
  }, []);

  // Manejar cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error para este campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Manejador de toggle para opciones booleanas
  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Manejar cambio de imagen de perfil
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar adición de fotos adicionales
  const handleAdditionalPhotosChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAdditionalPhotos(prev => [...prev, ...files]);
      
      // Crear previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalPreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Eliminar una foto adicional
  const removeAdditionalPhoto = (index) => {
    setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!formData.age) {
      newErrors.age = 'La edad es obligatoria';
    } else if (parseFloat(formData.age) < 0) {
      newErrors.age = 'La edad debe ser un número positivo';
    }
    if (!formData.gender_id) {
      newErrors.gender_id = 'El género es obligatorio';
    }
    if (!formData.weight) {
      newErrors.weight = 'El peso es obligatorio';
    } else if (parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'El peso debe ser mayor que 0';
    }
    if (!formData.species_id) {
      newErrors.species_id = 'La especie es obligatoria';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cerrar modal con animación
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const petDataToSend = {
        ...formData,
        for_adoption: formData.for_adoption ? 1 : 0,
        for_sitting: formData.for_sitting ? 1 : 0,
        profile_image: profileImage,
        additional_photos: additionalPhotos
      };
      const response = await createPet(petDataToSend);
      handleClose();
      setTimeout(() => {
        onAdd(response.pet);
      }, 300);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Ha ocurrido un error al crear la mascota. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto p-4" 
      onClick={handleClose}
      style={{ transition: 'opacity 300ms ease-in-out', opacity: isVisible ? 1 : 0 }}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative" 
        onClick={e => e.stopPropagation()}
        style={{ 
          transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out', 
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          opacity: isVisible ? 1 : 0
        }}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors">
          <X size={20} />
        </button>
        
        <h3 className="text-2xl font-bold mb-4 text-green-700">Añadir mascota</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className='text-red-600'>*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border ${errors.name ? 'border-red-500' : 'border-green-200'} p-2 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition`}
                placeholder="Nombre de tu mascota"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-green-200 p-2 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                placeholder="Describe a tu mascota"
                rows="1"
              />
            </div>
          </div>
          {/* Características físicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad (años) <span className='text-red-600'>*</span></label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                step="0.1"
                min="0"
                className={`w-full border ${errors.age ? 'border-red-500' : 'border-green-200'} p-2 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition`}
                placeholder="Ej: 2"
              />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) <span className='text-red-600'>*</span></label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                className={`w-full border ${errors.weight ? 'border-red-500' : 'border-green-200'} p-2 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition`}
                placeholder="Ej: 5.2"
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Género <span className='text-red-600'>*</span></label>
              <select
                name="gender_id"
                value={formData.gender_id}
                onChange={handleChange}
                className={`w-full border ${errors.gender_id ? 'border-red-500' : 'border-green-200'} p-2 rounded-md bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition`}
              >
                <option value="">Selecciona un género</option>
                {genders.map(gender => (
                  <option key={gender.id} value={gender.id}>{gender.name}</option>
                ))}
              </select>
              {errors.gender_id && <p className="text-red-500 text-xs mt-1">{errors.gender_id}</p>}
            </div>
          </div>
          {/* Especie y raza */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especie <span className='text-red-600'>*</span></label>
              <select
                name="species_id"
                value={formData.species_id}
                onChange={handleChange}
                className={`w-full border ${errors.species_id ? 'border-red-500' : 'border-green-200'} p-2 rounded-md bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition`}
              >
                <option value="">Selecciona una especie</option>
                {species.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              {errors.species_id && <p className="text-red-500 text-xs mt-1">{errors.species_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <select
                name="breed_id"
                value={formData.breed_id}
                onChange={handleChange}
                className="w-full border border-green-200 p-2 rounded-md bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                disabled={!formData.species_id}
              >
                <option value="">Selecciona una raza</option>
                {breeds
                  .filter(breed => breed.species_id === parseInt(formData.species_id))
                  .map(breed => (
                    <option key={breed.id} value={breed.id}>{breed.name}</option>
                  ))}
              </select>
            </div>
          </div>
          {/* Características adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
              <select
                name="size_id"
                value={formData.size_id}
                onChange={handleChange}
                className="w-full border border-green-200 p-2 rounded-md bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              >
                <option value="">Selecciona un tamaño</option>
                {sizes.map(size => (
                  <option key={size.id} value={size.id}>{size.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de actividad</label>
              <select
                name="activity_level_id"
                value={formData.activity_level_id}
                onChange={handleChange}
                className="w-full border border-green-200 p-2 rounded-md bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              >
                <option value="">Selecciona un nivel</option>
                {activityLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de ruido</label>
              <select
                name="noise_level_id"
                value={formData.noise_level_id}
                onChange={handleChange}
                className="w-full border border-green-200 p-2 rounded-md bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
              >
                <option value="">Selecciona un nivel</option>
                {noiseLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Disponibilidad (versión mejorada con toggles) */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">Disponibilidad</label>
            <div className="flex flex-wrap gap-4">
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all
                  ${formData.for_adoption 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}
                onClick={() => handleToggle('for_adoption')}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${formData.for_adoption ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {formData.for_adoption && <Check size={12} className="text-white" />}
                </div>
                <span>Disponible para adopción</span>
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all
                  ${formData.for_sitting 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}
                onClick={() => handleToggle('for_sitting')}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${formData.for_sitting ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {formData.for_sitting && <Check size={12} className="text-white" />}
                </div>
                <span>Disponible para cuidado</span>
              </div>
            </div>
            {errors.for_adoption && <p className="text-red-500 text-xs mt-1">{errors.for_adoption}</p>}
            {errors.for_sitting && <p className="text-red-500 text-xs mt-1">{errors.for_sitting}</p>}
          </div>
          {/* Imágenes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto de perfil</label>
              <div className="flex items-center space-x-4">
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-green-200 border-dashed rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-green-400" />
                    <p className="text-xs text-gray-500 mt-1">Subir imagen</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </label>
                {profilePreview && (
                  <div className="relative group">
                    <img
                      src={profilePreview}
                      alt="Vista previa"
                      className="w-32 h-32 object-cover rounded-lg shadow-md transition transform group-hover:scale-105"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition"
                      onClick={() => {
                        setProfileImage(null);
                        setProfilePreview(null);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fotos adicionales</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-green-200 border-dashed rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <Plus className="w-6 h-6 text-green-400" />
                    <p className="text-xs text-gray-500 mt-1">Añadir</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalPhotosChange}
                  />
                </label>
                {additionalPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Foto adicional ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg shadow-md transition transform group-hover:scale-105"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition"
                      onClick={() => removeAdditionalPhoto(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Guardando...</span>
                </div>
              ) : 'Guardar mascota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}