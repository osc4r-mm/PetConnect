import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, SortAsc, SortDesc, Heart, PawPrint, Award, VolumeX, Zap, Volume2, Ruler, Mars, Venus } from 'lucide-react';
import { getPets, getSpecies, getBreeds, getGenders, getSizes, getActivityLevels, getNoiseLevels } from '../services/petService';

export default function Home() {
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [animatingCards, setAnimatingCards] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // meta data lists fetched from API
  const [speciesList, setSpeciesList] = useState([]);
  const [breedList, setBreedList] = useState([]);
  const [genderList, setGenderList] = useState([]);
  const [sizeList, setSizeList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [noiseList, setNoiseList] = useState([]);

  const [filters, setFilters] = useState({
    name: '', ageMin: '', ageMax: '', weightMin: '', weightMax: '',
    gender_id: '', for_adoption: true, for_sitting: true,
    species_id: '', breed_id: '', size_id: '', activity_level_id: '', noise_level_id: ''
  });

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes loadingBar { 0% { width: 0%; } 100% { width: 100%; } }
      @keyframes pawBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    getSpecies().then(setSpeciesList);
    getBreeds().then(setBreedList);
    getGenders().then(setGenderList);
    getSizes().then(setSizeList);
    getActivityLevels().then(setActivityList);
    getNoiseLevels().then(setNoiseList);
  }, []);

  useEffect(() => {
    setLoading(true);
    getPets(page, { ...filters, sort_key: sortConfig.key, sort_direction: sortConfig.direction })
      .then(data => { setPets(data.data); setLastPage(data.last_page); })
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
    const direction = (sortConfig.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
    setAnimatingCards(true);
    setSortConfig({ key, direction });
    setTimeout(() => setAnimatingCards(false), 300);
  };

  const renderSortButton = (field, label) => {
    const isActive = sortConfig.key === field;
    const isAsc = sortConfig.direction === 'asc';
    return (
      <button onClick={() => handleSort(field)} title={`Ordenar por ${label}`} className={`ml-2 inline-flex items-center ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-500'}`}>
        {isActive ? (isAsc ? <SortAsc size={18}/> : <SortDesc size={18}/>) : <SortAsc size={16} className="opacity-70" />}
      </button>
    );
  };

  const filteredBreeds = filters.species_id
    ? breedList.filter(b => b.species_id === Number(filters.species_id))
    : breedList;


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
                {genderList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                {filteredBreeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
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
                {sizeList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                {activityList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
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
                {noiseList.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* cards grid */}
      {loading ? <LoadingPlaceholder /> : pets.length > 0 ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-500 ${animatingCards ? 'opacity-20 blur-sm' : 'opacity-100 blur-0'}`}>
          {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
        </div>
      ) : (
        <NoResults onReset={() => setFilters({
          name: '', ageMin: '', ageMax: '', weightMin: '', weightMax: '',
          for_adoption: false, for_sitting: false,
          species_id: '', breed_id: '', size_id: '', activity_level_id: '', noise_level_id: ''
        })} />
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 bg-gray-200 rounded mr-2">Anterior</button>
        <span className="px-4 py-2">{page} / {lastPage}</span>
        <button onClick={() => setPage(p => Math.min(lastPage, p+1))} disabled={page === lastPage} className="px-4 py-2 bg-gray-200 rounded ml-2">Siguiente</button>
      </div>
    </div>
  );
}

// ----- Componentes auxiliares ----- //
// Función para determinar colores por especie
const getSpeciesStyles = (species) => {
  switch(species?.toLowerCase()) {
    case 'perro':
      return 'border-blue-400 shadow-blue-200';
    case 'gato':
      return 'border-orange-400 shadow-orange-200';
    case 'ave':
      return 'border-green-400 shadow-green-200';
    case 'reptil':
      return 'border-purple-400 shadow-purple-200';
    case 'roedor':
      return 'border-yellow-400 shadow-yellow-200';
    default:
      return 'border-gray-400 shadow-gray-200';
  }
};

// Obtener ícono y color para nivel de actividad
const getActivityIcon = (level) => {
  if (!level) return { icon: <Zap size={16} />, color: 'bg-gray-300' };
  
  const name = level.name?.toLowerCase();
  if (name?.includes('baj')) {
    return { icon: <Zap size={16} />, color: 'bg-green-200' };
  } else if (name?.includes('med')) {
    return { icon: <Zap size={16} />, color: 'bg-yellow-200' };
  } else if (name?.includes('alt')) {
    return { icon: <Zap size={16} />, color: 'bg-red-200' };
  }
  return { icon: <Zap size={16} />, color: 'bg-gray-300' };
};

// Obtener ícono y color para nivel de ruido
const getNoiseIcon = (level) => {
  if (!level) return { icon: <VolumeX size={16} />, color: 'bg-gray-300' };
  
  const name = level.name?.toLowerCase();
  if (name?.includes('silen') || name?.includes('baj')) {
    return { icon: <VolumeX size={16} />, color: 'bg-green-200' };
  } else if (name?.includes('med')) {
    return { icon: <Volume2 size={16} opacity={0.5} />, color: 'bg-yellow-200' };
  } else if (name?.includes('alt')) {
    return { icon: <Volume2 size={16} />, color: 'bg-red-200' };
  }
  return { icon: <VolumeX size={16} />, color: 'bg-gray-300' };
};

// Componente para el tamaño con icono visual
const SizeTag = ({ size }) => {
  if (!size) return null;
  
  let sizeClass = '';
  let label = size.name || 'N/D';
  
  const name = size.name?.toLowerCase();
  if (name?.includes('pequeñ') || name?.includes('mini')) {
    sizeClass = 'h-2';
  } else if (name?.includes('med')) {
    sizeClass = 'h-4';
  } else if (name?.includes('grand')) {
    sizeClass = 'h-6';
  }
  
  return (
    <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
      <Ruler size={14} />
      <div className={`w-6 ${sizeClass} bg-gray-400 rounded-full`}></div>
    </div>
  );
};

function PetCard_backup({ pet }) {
  const [isHovered, setIsHovered] = useState(false);
  const speciesClass = getSpeciesStyles(pet.species?.name);
  const activityInfo = getActivityIcon(pet.activityLevel);
  const noiseInfo = getNoiseIcon(pet.noiseLevel);
  
  // Edad formateada
  const formatAge = (age) => {
    if (age === null || age === undefined) return 'Edad N/D';
    return age === 1 ? '1 año' : `${age} años`;
  };
  
  return (
    <div 
      className={`bg-white rounded-lg overflow-hidden relative transform transition-all duration-500 hover:scale-105 border-2 ${speciesClass}`}
      style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges para adopción/cuidado */}
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        {pet.for_adoption && 
          <div className="bg-red-500 p-1 rounded-full" title="Disponible para adopción">
            <Heart size={20} className="text-white" />
          </div>
        }
        {pet.for_sitting && 
          <div className="bg-blue-500 p-1 rounded-full" title="Necesita cuidador">
            <PawPrint size={20} className="text-white" />
          </div>
        }
      </div>
      
      {/* Imagen con overlay */}
      <div className="relative">
        <img 
          src={pet.profile_path || "/api/placeholder/400/320"} 
          alt={pet.name} 
          className="w-full h-48 object-cover transition-all duration-700 hover:scale-110" 
        />
        {isHovered && pet.species && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-2">
            <span className="text-white text-xs font-medium">
              {pet.species.name || 'Especie N/D'}
            </span>
          </div>
        )}
      </div>
      
      {/* Contenido */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">{pet.name}</h2>
          
          {/* Género con icono */}
          {pet.gender && (
            <div 
              className={`p-1 rounded-full ${pet.gender.name?.toLowerCase()?.includes('macho') ? 'bg-blue-100' : 'bg-pink-100'}`}
            >
              {pet.gender.name?.toLowerCase()?.includes('macho') ? 
                <Mars size={18} className="text-blue-500" /> : 
                <Venus size={18} className="text-pink-500" />
              }
            </div>
          )}
        </div>
        
        {/* Raza */}
        <div className="mb-2">
          <span className="text-sm font-medium mr-1">Raza:</span>
          <span className="text-sm text-gray-700">{pet.breed?.name || 'N/D'}</span>
        </div>
        
        {/* Características con iconos */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Edad */}
          <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
            <Award size={14} />
            <span className="text-xs">{formatAge(pet.age)}</span>
          </div>
          
          {/* Tamaño */}
          <SizeTag size={pet.size} />
          
          {/* Nivel de actividad */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${activityInfo.color}`}>
            {activityInfo.icon}
            <span className="text-xs">{pet.activity_Level?.name || 'Actividad N/D'}</span>
          </div>
          
          {/* Nivel de ruido */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${noiseInfo.color}`}>
            {noiseInfo.icon}
            <span className="text-xs">{pet.noise_Level?.name || 'Ruido N/D'}</span>
          </div>
        </div>
        
        {/* Descripción */}
        <p className="text-gray-600 text-sm">{pet.description || 'Sin descripción'}</p>
      </div>
    </div>
  );
}

function PetCard({ pet }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatAge = (age) => {
    if (age === null || age === undefined) return 'Edad N/D';
    return age === 1 ? '1 año' : `${age} años`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      
      <div className="relative">
        <div className="absolute top-2 right-2 flex space-x-2">
          {pet.for_adoption && <div className="bg-red-500 p-1 rounded-full"><Heart size={20} className="text-white" /></div>}
          {pet.for_sitting && <div className="bg-blue-500 p-1 rounded-full"><PawPrint size={20} className="text-white" /></div>}
        </div>
        <img src={pet.profile_path} alt={pet.name} className="w-full h-48 object-cover transition-all duration-700 hover:scale-110 hover:rotate-1" 
        onMouseEnter={() => setIsHovered(false)}  
        onMouseLeave={() => setIsHovered(true)}/>
        {isHovered && pet.species && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-2">
            <span className="text-white text-xs font-medium">
              {pet.species.name || 'Especie N/D'}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">{pet.name}</h2>
          
          {/* Género con icono */}
          {pet.gender && (
            <span 
              className={`p-1 rounded-full ${pet.gender.name?.toLowerCase()?.includes('macho') ? 'bg-blue-100' : 'bg-pink-100'}`}
            >
              {pet.gender.name?.toLowerCase()?.includes('macho') ? 
                <Mars size={18} className="text-blue-500" /> : 
                <Venus size={18} className="text-pink-500" />
              }
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          <Tag label={pet.breed?.name || 'N/D'} />
          <Tag label={formatAge(pet.age)} />
          <Tag label={pet.size?.name || 'N/D'} />
          <Tag label={pet.activity_level?.name || 'N/D'} />
          <Tag label={pet.noise_level?.name || 'N/D'} />
        </div>
        <p className="text-gray-600 text-sm">{pet.description || 'Sin descripción'}</p>
      </div>
    </div>
  );
}

function Tag({ label }) {
  return <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{label}</span>;
}

const LoadingPlaceholder = () => (
  <div className="relative min-h-[300px] flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 animate-spin">
        <PawPrint className="absolute top-0 animate-bounce" size={16} />
        <PawPrint className="absolute top-0 right-0 animate-bounce" size={16} style={{ animationDelay: '0.2s' }} />
        <PawPrint className="absolute bottom-0 animate-bounce" size={16} style={{ animationDelay: '0.4s' }} />
        <PawPrint className="absolute bottom-0 right-0 animate-bounce" size={16} style={{ animationDelay: '0.6s' }} />
      </div>
      <p className="mt-4 text-lg font-medium text-blue-700">Buscando peluditos...</p>
      <div className="mt-2 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-loadingBar"></div>
      </div>
    </div>
  </div>
);

const NoResults = ({ onReset }) => (
  <div className="text-center py-8">
    <p className="text-gray-500 text-lg">No se encontraron mascotas que coincidan con los filtros</p>
    <button onClick={onReset} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Limpiar filtros</button>
  </div>
);