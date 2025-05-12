import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Heart, PawPrint, SortAsc, SortDesc } from 'lucide-react';
import { getPets, getSpecies, getBreeds } from '../services/petService';

const GENDERS = { 1: 'Macho', 2: 'Hembra' };
const SIZES = { 1: 'Pequeño', 2: 'Mediano', 3: 'Grande' };
const ACTIVITY_LEVELS = { 1: 'Bajo', 2: 'Medio', 3: 'Alto' };
const NOISE_LEVELS = { 1: 'Silencioso', 2: 'Moderado', 3: 'Ruidoso' };

export default function Home() {
    const [showFilters, setShowFilters] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [animatingCards, setAnimatingCards] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pets, setPets] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // meta data
    const [speciesList, setSpeciesList] = useState([]);
    const [allBreeds, setAllBreeds] = useState([]);

    const [filters, setFilters] = useState({
        name: '',
        ageMin: '',
        ageMax: '',
        weightMin: '',
        weightMax: '',
        gender_id: '',
        for_adoption: false,
        for_sitting: false,
        species_id: '',
        breed_id: '',
        size_id: '',
        activity_level_id: '',
        noise_level_id: ''
    });

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

  // fetch species and breeds once
  useEffect(() => {
    getSpecies().then(data => setSpeciesList(data));
    getBreeds().then(data => setAllBreeds(data));
  }, []);

  // fetch pets when filters/page change
  useEffect(() => {
    setLoading(true);
    getPets(page, { ...filters, sort_key: sortConfig.key, sort_direction: sortConfig.direction })
      .then(data => {
        setPets(data.data);
        setLastPage(data.last_page);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filters, sortConfig]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setAnimatingCards(true);
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setPage(1);
    setTimeout(() => setAnimatingCards(false), 300);
  };

  const handleSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setAnimatingCards(true);
    setSortConfig({ key, direction });
    setTimeout(() => setAnimatingCards(false), 300);
  };

  const renderSortButton = (field, label) => {
    const isActive = sortConfig.key === field;
    const isAsc = sortConfig.direction === 'asc';
    return (
      <button 
      onClick={() => handleSort(field)} 
      title={`Ordenar por ${label}`} 
      className={`ml-2 inline-flex items-center transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-500'}`
      }>
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

  // filter breeds by selected species
  const breedOptions = filters.species_id
    ? allBreeds.filter(b => b.species_id === Number(filters.species_id))
    : allBreeds;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Encuentra tu compañero
      </h1>

      {/* search & toggle */}
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
                className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md flex items-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    Filtros {showFilters ? <ChevronUp /> : <ChevronDown />}
                </button>
            </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            {/* age */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                    <span className="text-gray-500">-</span>
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
            
            {/* weight */}
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

            {/* adoption/sitting */}
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
                  name="for_sitting"
                  checked={filters.for_sitting}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className={`relative inline-block w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${filters.for_sitting ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <span className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${filters.for_sitting ? 'transform translate-x-5' : ''}`}></span>
                </span>
                <span className="ml-2 text-gray-700">Cuidado</span>
              </label>
            </div>
          
            {/* gender */}
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

            {/* species */}
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
                {speciesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* breed */}
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
                {breedOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* size */}
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

            {/* activity level */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700">Nivel de actividad</label>
                {renderSortButton('activity_level_id', 'Actividad')}
              </div>
              <select
                name="activity_level_id"
                value={filters.activity_level_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todos</option>
                {Object.entries(ACTIVITY_LEVELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
            {/* noise level */}
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

      {/* cards grid */}
      {!loading ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-500 ${animatingCards ? 'opacity-20 blur-sm' : 'opacity-100 blur-0'}`}>
          {pets.map(pet => (
            <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden relative transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:z-10">
              {/* Iconos de adopción y cuidado */}
              <div className="absolute top-2 right-2 flex space-x-2">
                {pet.for_adoption && (
                  <div 
                    className="bg-red-500 p-1 rounded-full transform transition-all duration-500 hover:rotate-12 hover:scale-110 hover:shadow-lg" 
                    title="Disponible para adopción">
                    <Heart size={20} className="text-white" />
                  </div>
                )}
                {pet.for_sitting && (
                  <div 
                    className="bg-blue-500 p-1 rounded-full transform transition-all duration-500 hover:rotate-12 hover:scale-110 hover:shadow-lg" 
                    title="Disponible para cuidado">
                    <PawPrint size={20} className="text-white" />
                  </div>
                )}
              </div>

              <div className="overflow-hidden">
                <img 
                  src={pet.profile_path} 
                  alt={pet.name} 
                  className="w-full h-48 object-cover transition-all duration-700 hover:scale-110 hover:rotate-1" />
              </div>
              <div className="p-4">
                <h2 className="font-bold text-lg">{pet.name} <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{GENDERS[pet.gender_id]}</span></h2>
                <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{pet.breed_id}</span>
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
        <p>Cargando...</p>
      )}

      {/* pagination */}
      <div className="flex justify-center mt-6">
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-4 py-2 bg-gray-200 rounded mr-2">Anterior</button>
        <span className="px-4 py-2">{page} / {lastPage}</span>
        <button onClick={() => setPage(p => Math.min(lastPage, p+1))} disabled={page===lastPage} className="px-4 py-2 bg-gray-200 rounded ml-2">Siguiente</button>
      </div>
    </div>
  );
}
