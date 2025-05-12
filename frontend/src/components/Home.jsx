import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Heart, PawPrint, SortAsc, SortDesc } from 'lucide-react';
import { getAllPets } from '../services/petService';

// Mapas de referencia para mostrar etiquetas
const GENDERS = { 1: 'Macho', 2: 'Hembra' };
const SPECIES = { 1: 'Perro', 2: 'Gato' };
const BREEDS = { 1: 'Labrador', 2: 'Beagle', 3: 'Bulldog', 4: 'Chihuahua' };
const SIZES = { 1: 'Pequeño', 2: 'Mediano', 3: 'Grande' };
const ACTIVITY_LEVELS = { 1: 'Bajo', 2: 'Medio', 3: 'Alto' };
const NOISE_LEVELS = { 1: 'Silencioso', 2: 'Moderado', 3: 'Ruidoso' };

export default function Home() {
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [animatingCards, setAnimatingCards] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);

  
  // Estilo personalizado para la animación de carga
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes loadingBar {
        0% { width: 0%; }
        50% { width: 70%; }
        70% { width: 80%; }
        90% { width: 90%; }
        95% { width: 95%; }
        100% { width: 100%; }
      }
      .animate-loadingBar {
        animation: loadingBar 2s ease-in-out infinite;
      }
      @keyframes pawBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .paw-bounce {
        animation: pawBounce 1s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  const [filters, setFilters] = useState({
    name: '',
    ageMin: '',
    ageMax: '',
    weightMin: '',
    weightMax: '',
    gender_id: '',
    for_adoption: false,
    available_for_sitting: false,
    species_id: '',
    breed_id: '',
    size_id: '',
    activity_level_id: '',
    noise_level_id: '',
  });

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const data = await getAllPets();
        setPets(data);
      } catch (error) {
        console.error('Error al cargar mascotas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);


  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    
    // Añadir animación al cambiar filtros
    setAnimatingCards(true);
    
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Quitar animación después de un tiempo
    setTimeout(() => {
      setAnimatingCards(false);
    }, 300);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    // Añadir animación al ordenar
    setAnimatingCards(true);
    
    setSortConfig({ key, direction });
    
    // Quitar animación después de un tiempo
    setTimeout(() => {
      setAnimatingCards(false);
    }, 300);
  };

  const filteredPets = pets.filter(pet => {
    // Lógica especial para adopción y cuidado (OR en vez de AND)
    const matchesAdoptionOrSitting = 
      (!filters.for_adoption && !filters.available_for_sitting) || // No hay filtros activados
      (filters.for_adoption && pet.for_adoption) ||               // Coincide con adopción 
      (filters.available_for_sitting && pet.available_for_sitting); // Coincide con cuidado
    
    return (
      pet.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.ageMin === '' || pet.age >= Number(filters.ageMin)) &&
      (filters.ageMax === '' || pet.age <= Number(filters.ageMax)) &&
      (filters.weightMin === '' || pet.weight >= Number(filters.weightMin)) &&
      (filters.weightMax === '' || pet.weight <= Number(filters.weightMax)) &&
      (!filters.gender_id || pet.gender_id === Number(filters.gender_id)) &&
      matchesAdoptionOrSitting &&
      (!filters.species_id || pet.species_id === Number(filters.species_id)) &&
      (!filters.breed_id || pet.breed_id === Number(filters.breed_id)) &&
      (!filters.size_id || pet.size_id === Number(filters.size_id)) &&
      (!filters.activity_level_id || pet.activity_level_id === Number(filters.activity_level_id)) &&
      (!filters.noise_level_id || pet.noise_level_id === Number(filters.noise_level_id))
    );
  });

  // Ordenar los resultados
  const sortedPets = [...filteredPets];
  if (sortConfig.key) {
    sortedPets.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Funciones para botones de ordenamiento mejorados
  const renderSortButton = (field, label) => {
    const isActive = sortConfig.key === field;
    const isAsc = sortConfig.direction === 'asc';
    
    return (
      <button 
        className={`ml-2 inline-flex items-center transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-500'}`}
        onClick={() => handleSort(field)}
        title={`Ordenar por ${label} ${isActive && isAsc ? 'descendente' : 'ascendente'}`}
      >
        {isActive ? (
          isAsc ? (
            <SortAsc size={18} className="filter drop-shadow-md" />
          ) : (
            <SortDesc size={18} className="filter drop-shadow-md" />
          )
        ) : (
          <SortAsc size={16} className="opacity-70" />
        )}
      </button>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Encuentra tu compañero</h1>

      {/* Buscador y toggle de filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="flex items-center">
            <input
              type="text"
              name="name"
              placeholder="Buscar por nombre..."
              value={filters.name}
              onChange={handleChange}
              className="flex-grow block border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md flex items-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Filtros {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </button>
          </div>
        </div>

        {/* Filtros desplegables con animación */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Edad */}
            <div className="col-span-2">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Edad (años)</label>
                {renderSortButton('age', 'Edad')}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="number"
                  name="ageMin"
                  min="0"
                  max="20"
                  value={filters.ageMin}
                  onChange={handleChange}
                  placeholder="Min"
                  className="w-1/2 border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <span className="text-gray-500">–</span>
                <input
                  type="number"
                  name="ageMax"
                  min="0"
                  max="20"
                  value={filters.ageMax}
                  onChange={handleChange}
                  placeholder="Max"
                  className="w-1/2 border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Peso */}
            <div className="col-span-2">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                {renderSortButton('weight', 'Peso')}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="number"
                  name="weightMin"
                  min="0"
                  max="100"
                  value={filters.weightMin}
                  onChange={handleChange}
                  placeholder="Min"
                  className="w-1/2 border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <span className="text-gray-500">–</span>
                <input
                  type="number"
                  name="weightMax"
                  min="0"
                  max="100"
                  value={filters.weightMax}
                  onChange={handleChange}
                  placeholder="Max"
                  className="w-1/2 border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Checkbox mejorados */}
            <div className="col-span-1 flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="for_adoption"
                  checked={filters.for_adoption}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${filters.for_adoption ? 'bg-red-500' : 'bg-gray-300'}`}>
                  <span className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${filters.for_adoption ? 'transform translate-x-5' : ''}`}></span>
                </span>
                <span className="ml-2 text-gray-700">Adopción</span>
              </label>
            </div>
            <div className="col-span-1 flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="available_for_sitting"
                  checked={filters.available_for_sitting}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${filters.available_for_sitting ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <span className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${filters.available_for_sitting ? 'transform translate-x-5' : ''}`}></span>
                </span>
                <span className="ml-2 text-gray-700">Cuidado</span>
              </label>
            </div>

            {/* Selects mejorados */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Género</label>
                {renderSortButton('gender_id', 'Género')}
              </div>
              <select
                name="gender_id"
                value={filters.gender_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todos</option>
                {Object.entries(GENDERS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Especie</label>
                {renderSortButton('species_id', 'Especie')}
              </div>
              <select
                name="species_id"
                value={filters.species_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todas</option>
                {Object.entries(SPECIES).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Raza</label>
                {renderSortButton('breed_id', 'Raza')}
              </div>
              <select
                name="breed_id"
                value={filters.breed_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todas</option>
                {Object.entries(BREEDS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Tamaño</label>
                {renderSortButton('size_id', 'Tamaño')}
              </div>
              <select
                name="size_id"
                value={filters.size_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todos</option>
                {Object.entries(SIZES).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Actividad</label>
                {renderSortButton('activity_level_id', 'Actividad')}
              </div>
              <select
                name="activity_level_id"
                value={filters.activity_level_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todas</option>
                {Object.entries(ACTIVITY_LEVELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Nivel de ruido</label>
                {renderSortButton('noise_level_id', 'Ruido')}
              </div>
              <select
                name="noise_level_id"
                value={filters.noise_level_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todos</option>
                {Object.entries(NOISE_LEVELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de carga y resultados */}
      {loading ? (
        // Efecto de carga mucho más molón con pulgitas y todo 🐾
        <div className="relative min-h-[300px] flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                {/* Huellitas girando */}
                <div className="absolute w-16 h-16 animate-spin">
                  <PawPrint className="absolute top-0 text-blue-600 animate-bounce" size={16} />
                  <PawPrint className="absolute top-0 right-0 text-red-500 animate-bounce" size={16} style={{ animationDelay: "0.2s" }} />
                  <PawPrint className="absolute bottom-0 text-green-500 animate-bounce" size={16} style={{ animationDelay: "0.4s" }} />
                  <PawPrint className="absolute bottom-0 right-0 text-purple-500 animate-bounce" size={16} style={{ animationDelay: "0.6s" }} />
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-blue-700">Buscando peluditos...</p>
              <div className="mt-2 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-loadingBar"></div>
              </div>
            </div>
          </div>
          
          <style jsx>{`
            @keyframes loadingBar {
              0% { width: 0%; }
              50% { width: 70%; }
              70% { width: 80%; }
              90% { width: 90%; }
              95% { width: 95%; }
              100% { width: 100%; }
            }
            .animate-loadingBar {
              animation: loadingBar 2s ease-in-out infinite;
            }
          `}</style>
        </div>
      ) : (
        sortedPets.length > 0 ? (
          // Grid de mascotas con animación mejorada para cuando cambia filtros y tal
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-500 ${animatingCards ? 'opacity-20 blur-sm' : 'opacity-100 blur-0'}`}>
            {sortedPets.map((pet) => (
              <div 
                key={pet.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden relative transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:z-10"
              >
                {/* Iconos de adopción y cuidado */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  {pet.for_adoption && (
                    <div 
                      className="bg-red-500 p-1 rounded-full transform transition-all duration-500 hover:rotate-12 hover:scale-110 hover:shadow-lg" 
                      title="Disponible para adopción"
                    >
                      <Heart size={20} className="text-white" />
                    </div>
                  )}
                  {pet.available_for_sitting && (
                    <div 
                      className="bg-blue-500 p-1 rounded-full transform transition-all duration-500 hover:rotate-12 hover:scale-110 hover:shadow-lg" 
                      title="Disponible para cuidado"
                    >
                      <PawPrint size={20} className="text-white" />
                    </div>
                  )}
                </div>
                
                <div className="overflow-hidden">
                  <img 
                    src={pet.image} 
                    alt={pet.name} 
                    className="w-full h-48 object-cover transition-all duration-700 hover:scale-110 hover:rotate-1" 
                  />
                </div>
                <div className="p-4 border-t border-gray-100">
                  <h2 className="text-xl font-semibold text-blue-800 mb-2">{pet.name}</h2>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{GENDERS[pet.gender_id]}</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{BREEDS[pet.breed_id]}</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{pet.age} años</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {pet.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Mensaje cuando no hay resultados
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No se encontraron mascotas que coincidan con los filtros</p>
            <button 
              onClick={() => setFilters({
                name: '',
                ageMin: '',
                ageMax: '',
                weightMin: '',
                weightMax: '',
                gender_id: '',
                for_adoption: false,
                available_for_sitting: false,
                species_id: '',
                breed_id: '',
                size_id: '',
                activity_level_id: '',
                noise_level_id: '',
              })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )
      )}
    </div>
  );
}

