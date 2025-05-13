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
    name: '', age_min: '', age_max: '', weight_min: '', weight_max: '',
    gender_id: '', for_adoption: true, for_sitting: true,
    species_id: '', breed_id: '', size_id: '', activity_level_id: '', noise_level_id: ''
  });

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
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 sticky top-1 z-10">
        <div className="grid grid-cols-1 gap-4">
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

        <div className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
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
                      name="age_min"
                      min="0"
                      max="20"
                      value={filters.age_min}
                      onChange={handleChange}
                      placeholder="Min"
                      className="w-1/2 border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                    <span className="text-gray-500">&lt;</span>
                    <input
                      type="number"
                      name="age_max"
                      min="0"
                      max="20"
                      value={filters.age_max}
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
                  name="weight_min"
                  min="0"
                  max="100"
                  value={filters.weight_min}
                  onChange={handleChange}
                  placeholder="Min"
                  className="w-1/2 border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <span className="text-gray-500">&lt;</span>
                <input
                  type="number"
                  name="weight_max"
                  min="0"
                  max="100"
                  value={filters.weight_max}
                  onChange={handleChange}
                  placeholder="Max"
                  className="w-1/2 border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* adoption/sitting switches - MEJORADOS */}
            <div className="col-span-2 flex items-end justify-center space-x-6">
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adopción</label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="for_adoption"
                    checked={filters.for_adoption}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${filters.for_adoption ? 'bg-red-500' : 'bg-gray-300'}`}>
                    <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 ease-in-out ${filters.for_adoption ? 'transform translate-x-6' : ''}`}></span>
                  </span>
                </label>
              </div>
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuidado</label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="for_sitting"
                    checked={filters.for_sitting}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${filters.for_sitting ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 ease-in-out ${filters.for_sitting ? 'transform translate-x-6' : ''}`}></span>
                  </span>
                </label>
              </div>
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
        <div>
          {/* Pagination */}
          <div className="flex justify-center m-6">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 bg-gray-200 rounded mr-2 disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
            <span className="px-4 py-2">{page} / {lastPage}</span>
            <button onClick={() => setPage(p => Math.min(lastPage, p+1))} disabled={page === lastPage} className="px-4 py-2 bg-gray-200 rounded ml-2 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-500 ${animatingCards ? 'opacity-20 blur-sm' : 'opacity-100 blur-0'}`}>
            {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
          </div>
          {/* Pagination */}
          
          {(pets.length > 8 || (pets.length > 4 && showFilters)) && (
          <div className="flex justify-center mt-6">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 bg-gray-200 rounded mr-2 disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
            <span className="px-4 py-2">{page} / {lastPage}</span>
            <button onClick={() => setPage(p => Math.min(lastPage, p+1))} disabled={page === lastPage} className="px-4 py-2 bg-gray-200 rounded ml-2 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
          </div> )}
        </div>
      ) : (
        <NoResults onReset={() => setFilters({
          name: '', age_min: '', age_max: '', weight_min: '', weight_max: '',
          for_adoption: true, for_sitting: true,
          species_id: '', breed_id: '', size_id: '', activity_level_id: '', noise_level_id: ''
        })} />
      )}
    </div>
  );
}

// ----- Componentes auxiliares ----- //
function PetCard({ pet }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatAge = (age) => {
    if (age === null || age === undefined) return null;
    return age === 1 ? '1 año' : `${age} años`;
  };

  const formatWeight = (weight) => {
    if (weight == null) return null;
    const valueStr = weight.toString().replace(/\.0+$/, '');
    return `${valueStr} kg`;
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
        <img src={pet.profile_path} alt={pet.name} className="w-full h-48 object-cover transition-all duration-700 hover:rotate-1" 
        onMouseEnter={() => setIsHovered(false)}  
        onMouseLeave={() => setIsHovered(true)}/>
        {isHovered && pet.species && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-2">
            <span className="text-white text-xs font-medium">
              {pet.species.name}
            </span>
          </div>
        )}
      </div>

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

        <div className="flex flex-wrap gap-1 mb-2">
          {pet.breed?.name && <Tag label={pet.breed.name} />}
          {formatAge(pet.age) && <Tag label={formatAge(pet.age)} />}
          {pet.weight && <Tag label={formatWeight(pet.weight)} />}
          {pet.size?.name && <Tag label={pet.size.name} />}
          {pet.activity_level?.name && <Tag label={pet.activity_level.name} />}
          {pet.noise_level?.name && <Tag label={pet.noise_level.name} />}
        </div>
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
        <PawPrint className="absolute top-0 animate-bounce text-blue-900" size={20} />
        <PawPrint className="absolute top-0 right-0 animate-bounce text-red-900" size={20} />
        <PawPrint className="absolute bottom-0 animate-bounce text-yellow-900" size={20} />
        <PawPrint className="absolute bottom-0 right-0 animate-bounce text-green-900" size={20} />
      </div>
      <p className="mt-4 text-lg font-medium text-blue-700">Buscando peluditos...</p>
    </div>
  </div>
);

const NoResults = ({ onReset }) => (
  <div className="text-center py-8">
    <p className="text-gray-500 text-lg">No se encontraron mascotas que coincidan con los filtros</p>
    <button onClick={onReset} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Limpiar filtros</button>
  </div>
);