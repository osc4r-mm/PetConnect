import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SortAsc, SortDesc, Heart, PawPrint, Mars, Venus } from 'lucide-react';
import { getPets, getSpecies, getBreeds, getGenders, getSizes, getActivityLevels, getNoiseLevels, getPetImageUrl } from '../../services/petService';
import { LoadingScreen, NotFoundData } from '../Util';
import FilterSection from './partials/FilterSection';

/* Guardar filtros y ahorrar en la carga */
const FILTERS_KEY = 'pet_filters';
const SORT_KEY = 'pet_sort';
function loadFilters() { try { return JSON.parse(localStorage.getItem(FILTERS_KEY)) || null; } catch { return null; } }
function saveFilters(f) { localStorage.setItem(FILTERS_KEY, JSON.stringify(f)); }
function loadSort() { try { return JSON.parse(localStorage.getItem(SORT_KEY)) || null; } catch { return null; } }
function saveSort(s) { localStorage.setItem(SORT_KEY, JSON.stringify(s)); }
function loadMetaList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch { return null; }
}
function saveMetaList(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export default function Home() {
  
  const [showFilters, setShowFilters] = useState(false);
  const [animatingCards, setAnimatingCards] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // meta data lists fetched from API
  const [speciesList, setSpeciesList] = useState(() => loadMetaList('speciesList') || []);
  const [breedList, setBreedList] = useState(() => loadMetaList('breedList') || []);
  const [genderList, setGenderList] = useState(() => loadMetaList('genderList') || []);
  const [sizeList, setSizeList] = useState(() => loadMetaList('sizeList') || []);
  const [activityList, setActivityList] = useState(() => loadMetaList('activityList') || []);
  const [noiseList, setNoiseList] = useState(() => loadMetaList('noiseList') || []);

  const defaultFilters = {
    name: '', age_min: '', age_max: '', weight_min: '', weight_max: '',
    gender_id: '', for_adoption: true, for_sitting: true,
    species_id: '', breed_id: '', size_id: '', activity_level_id: '', noise_level_id: ''
  };
  const [filters, setFilters] = useState(() => loadFilters() || defaultFilters);
  const [sortConfig, setSortConfig] = useState(() => loadSort() || { key: null, direction: 'asc' });

  useEffect(() => {
    if (speciesList.length === 0) {
      getSpecies().then(data => {
        setSpeciesList(data);
        saveMetaList('speciesList', data);
      });
    }
    if (breedList.length === 0) {
      getBreeds().then(data => {
        setBreedList(data);
        saveMetaList('breedList', data);
      });
    }
    if (genderList.length === 0) {
      getGenders().then(data => {
        setGenderList(data);
        saveMetaList('genderList', data);
      });
    }
    if (sizeList.length === 0) {
      getSizes().then(data => {
        setSizeList(data);
        saveMetaList('sizeList', data);
      });
    }
    if (activityList.length === 0) {
      getActivityLevels().then(data => {
        setActivityList(data);
        saveMetaList('activityList', data);
      });
    }
    if (noiseList.length === 0) {
      getNoiseLevels().then(data => {
        setNoiseList(data);
        saveMetaList('noiseList', data);
      });
    }
  }, [
    speciesList.length,
    breedList.length,
    genderList.length,
    sizeList.length,
    activityList.length,
    noiseList.length
  ]);

  useEffect(() => {
    setLoading(true);
    getPets(page, { ...filters, sort_key: sortConfig.key, sort_direction: sortConfig.direction })
      .then(data => { 
        setPets(data.data); 
        setLastPage(data.last_page); 
      })
      .catch(err => {
        console.error('Error fetching pets:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [page, filters, sortConfig]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    // Si cambias de especie y la raza seleccionada no es válida para la especie, resetea la raza
    let newFilters;
    if (name === 'species_id' && filters.breed_id) {
      const currentBreed = breedList.find(b => b.id === Number(filters.breed_id));
      if (value === '' || (currentBreed && currentBreed.species_id !== Number(value))) {
        setAnimatingCards(true);
        newFilters = { 
          ...filters, 
          [name]: value, 
          breed_id: ''
        };
        setFilters(newFilters);
        saveFilters(newFilters);
        setPage(1);
        setTimeout(() => setAnimatingCards(false), 300);
        return;
      }
    }

    newFilters = { ...filters, [name]: type === 'checkbox' ? checked : value };
    setAnimatingCards(true);
    setFilters(newFilters);
    saveFilters(newFilters);
    setPage(1);
    setTimeout(() => setAnimatingCards(false), 300);
  };

  const handleSort = key => {
    const direction = (sortConfig.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
    const newSort = { key, direction };
    setAnimatingCards(true);
    setSortConfig(newSort);
    saveSort(newSort);
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
  
  const clearFilters = () => {
    setFilters(defaultFilters);
    saveFilters(defaultFilters);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Encuentra tu compañero
      </h1>

      <FilterSection
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(s => !s)}
        filters={filters}
        onFilterChange={handleChange}
        renderSortButton={renderSortButton}
        metaLists={{ genderList, speciesList, breedList, sizeList, activityList, noiseList }}
      />
      {
      loading ? (
        <LoadingScreen message="Cargando mascotas..." />
      ) : error ? (
        <NotFoundData />
      ) : pets.length === 0 ? (
        <NoResults onReset={clearFilters} />
      ) : (
        <div className='p-1'>
          {/* Pagination arriba */}
          <div className="flex flex-col xxs:flex-row items-center justify-center mb-6 space-y-2 xxs:space-y-0 xxs:space-x-2">

            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed">&lt;</button>
            <span className="px-4 py-2">{page} / {lastPage}</span>
            <button onClick={() => setPage(p => Math.min(lastPage, p+1))} disabled={page === lastPage} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed">&gt;</button>
          </div>

          {/* Grid de mascotas */}
          <div className={`grid grid-cols-1 xxs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-500 ${animatingCards ? 'opacity-20 blur-xxs' : 'opacity-100 blur-0'}`}>
            {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
          </div>

          {/* Pagination abajo */}
          {(pets.length > 8 || (pets.length > 4 && showFilters)) && (
            <div className="flex flex-col xxs:flex-row items-center justify-center m-6 space-y-2 xxs:space-y-0 xxs:space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed">&lt;</button>
              <span className="px-4 py-2">{page} / {lastPage}</span>
              <button onClick={() => setPage(p => Math.min(lastPage, p+1))} disabled={page === lastPage} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed">&gt;</button>
            </div>
          )}
        </div>
      )
    }

    </div>
  );
}

// ----- Componentes auxiliares ----- //
function PetCard({ pet }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const formatAge = (age) => {
    if (age === null || age === undefined) return null;
    return age === 1 ? '1 año' : `${age} años`;
  };

  const formatWeight = (weight) => {
    if (weight == null) return null;
    const valueStr = weight.toString().replace(/\.0+$/, '');
    return `${valueStr} kg`;
  };

  const handleCardClick = () => {
    navigate(`/pet/${pet.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:z-10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}>
      
      <div className="relative">
        <div className="absolute top-2 right-2 flex space-x-2">
          {pet.for_adoption && <div className="bg-red-500 p-1 rounded-full"><Heart size={20} className="text-white" /></div>}
          {pet.for_sitting && <div className="bg-blue-500 p-1 rounded-full"><PawPrint size={20} className="text-white" /></div>}
        </div>
        <img src={getPetImageUrl(pet.profile_path)} alt={pet.name} className="w-full h-48 object-cover transition-all duration-700 hover:rotate-1" 
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

const NoResults = ({ clearFilters }) => (
  <div className="text-center py-8">
    <p className="text-gray-500 text-lg">No se encontraron mascotas.</p>
    <p className="text-gray-500 text-md">Prueba a limpiar los filtros</p>
    <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Limpiar filtros</button>
  </div>
);