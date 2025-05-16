import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { getUserById, updateUserLocation } from '../../services/userService';
import { searchCities } from '../../services/geoService';
import { LoadingScreen, NotFoundData } from '../Util';

import { User, Calendar, Plus, X, Search, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    authService.fetchUser()
      .then(data => {
        setCurrentUser(data);
        // Si estamos viendo el perfil de otro usuario pero es nuestro propio ID
        if (id && data && +id === data.id) {
          navigate('/profile', { replace: true });
          return;
        }
      })
      .catch(() => {});
  }, [id, navigate]);

  useEffect(() => {
    setLoading(true);
    const fetcher = id ? getUserById(id) : authService.fetchUser();
    fetcher
      .then(data => {
        setUser(data);
        
        // Determinar si es nuestro propio perfil
        setIsOwnProfile(!id || (currentUser && currentUser.id === data.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, currentUser]);

  const updateLocation = async (lat, lng) => {
    // Solo permitir actualización si es nuestro propio perfil
    if (!isOwnProfile) return;
    
    try {
      const updated = await updateUserLocation(user.id, { latitude: lat, longitude: lng });
      setUser(prev => ({ ...prev, latitude: updated.latitude, longitude: updated.longitude }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <NotFoundData message1='Usuario no encontrado' message2='No se ha podido acceder al perfil de este usuario' icon={User} />;

  return (
    <div className="container mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">
      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className="flex-1">
          <UserInfoSection user={user} />
        </div>
        <div className="flex-1">
          <MapSection
            latitude={user.latitude}
            longitude={user.longitude}
            editable={isOwnProfile}
            onUpdate={updateLocation}
          />
        </div>
      </div>
      {user.role?.name === 'caregiver' && <ScheduleSection />}
      <PetsSection
        pets={user.pets || []}
        onAddPet={() => setShowAddPetModal(true)}
        editable={isOwnProfile}
      />
      {showAddPetModal && (
        <AddPetModal
          onClose={() => setShowAddPetModal(false)}
          onAdd={newPet => {
            setUser(prev => ({ ...prev, pets: [newPet, ...prev.pets] }));
            setShowAddPetModal(false);
          }}
        />
      )}
    </div>
  );
}

function UserInfoSection({ user }) {
  return (
    <section className="mb-4">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <User className="mr-2 text-blue-600" /> Información de usuario
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role?.name}</p>
          <p><strong>Saldo:</strong> {user.wallet_balance ? `${user.wallet_balance}€` : '0.00€'}</p>
        </div>
        <div>
          {user.image && (
            <div className="flex justify-center md:justify-end">
              <img 
                src={user.image} 
                alt={user.name} 
                className="rounded-full w-24 h-24 object-cover border-2 border-blue-500"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center mb-2">
          <div className="flex-grow flex justify-between text-sm">
            <span>Roles disponibles:</span>
            {user.isAdmin && <span className="inline-block bg-red-500 text-white px-2 py-1 rounded-full text-xs mr-1">Admin</span>}
            {user.isCaregiver && <span className="inline-block bg-green-500 text-white px-2 py-1 rounded-full text-xs mr-1">Cuidador</span>}
            {!user.isAdmin && !user.isCaregiver && <span className="inline-block bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Usuario</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

function MapSection({ latitude, longitude, editable, onUpdate }) {
  const [viewPosition, setViewPosition] = useState([latitude || 0, longitude || 0]);
  const [markerPosition, setMarkerPosition] = useState([latitude || 0, longitude || 0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cada vez que cambie `position`, movemos el mapa
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(viewPosition, mapRef.current.getZoom());
    }
  }, [viewPosition]);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const cities = await searchCities(searchTerm);
          setSearchResults(cities);
          setShowDropdown(cities.length > 0);
        } catch (error) {
          console.error("Error buscando ciudades:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  function MapEventsHandler() {
    useMapEvents({
      dblclick: e => {
        if (!editable) return;
        const { lat, lng } = e.latlng;
        if (window.confirm(`¿Actualizar ubicación a [${lat.toFixed(4)}, ${lng.toFixed(4)}]?`)) {
          setMarkerPosition([lat, lng]);
          setViewPosition([lat, lng]);
          onUpdate(lat, lng);
        }
      }
    });
    return null;
  }

  const handleSelectCity = (city) => {
    const nLat = parseFloat(city.lat);
    const nLng = parseFloat(city.lon);
    setViewPosition([nLat, nLng]);
    mapRef.current?.setView([nLat, nLng], 13);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
    
  };

  useEffect(() => {
    // Actualizar posición cuando cambian las props
    if (latitude && longitude) {
      setViewPosition([latitude, longitude]);
      
      // Centrar el mapa en la nueva posición si el mapa está inicializado
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
      }
    }
  }, [latitude, longitude]);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Search className="mr-2 text-blue-600" /> Ubicación en el mapa
      </h2>
      <div className="flex mb-2 relative" ref={dropdownRef}>
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar ciudad..."
            className="border p-2 rounded-l-md w-full pr-8"
            disabled={!editable}
          />
          {isSearching && (
            <span className="absolute right-2 top-2 animate-spin text-gray-400">
              ⟳
            </span>
          )}
          
          {/* Lista desplegable de resultados */}
          {showDropdown && searchResults.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border shadow-md mt-1 rounded-md max-h-60 overflow-auto">
              {searchResults.map((city, index) => (
                <li 
                  key={index} 
                  className="p-2 hover:bg-blue-50 cursor-pointer flex items-center"
                  onClick={() => handleSelectCity(city)}
                >
                  <MapPin size={16} className="mr-2 text-blue-500" />
                  <span>
                    <strong>{city.name}</strong>
                    <span className="text-gray-500 text-sm ml-1">
                      {city.country}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => {
            if (searchTerm.trim() && searchResults.length > 0) {
              handleSelectCity(searchResults[0]);
            }
          }}
          className={`px-4 py-2 rounded-r-md ${editable 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          disabled={!editable || !searchTerm.trim() || searchResults.length === 0}
        >
          Buscar
        </button>
      </div>
      
      {/* Contenedor del mapa con z-index bajo */}
      <div className="relative" style={{ zIndex: 0 }}>
        <MapContainer
          key={viewPosition.join(',')}
          center={viewPosition}
          zoom={13}
          scrollWheelZoom={true}
          className="h-64 w-full rounded-lg mb-2"
          whenCreated={map => { mapRef.current = map }}
          style={{ zIndex: 0 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {editable && <MapEventsHandler />}
          <Marker
            position={markerPosition}
            icon={customIcon}
            draggable={editable}
            eventHandlers={editable ? {
              dragend: e => {
                const { lat, lng } = e.target.getLatLng();
                setMarkerPosition([lat, lng]);
                onUpdate(lat, lng);
              }
            } : {}}
          >
            <Popup>
              {editable 
                ? 'Arrastra o haz doble clic para cambiar ubicación' 
                : 'Ubicación del usuario'}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      {editable ? (
        <p className="text-sm text-gray-500">Puedes acercar/alejar con la rueda del ratón y actualizar la ubicación arrastrando el marcador o haciendo doble clic.</p>
      ) : (
        <p className="text-sm text-gray-500">Solo puedes ver la ubicación.</p>
      )}
    </section>
  );
}

function ScheduleSection() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Calendar className="mr-2 text-blue-600" /> Horario semanal
      </h2>
      {/* ... tabla como antes ... */}
    </section>
  );
}

function PetsSection({ pets, onAddPet, editable }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Plus className="mr-2 text-blue-600" /> Mascotas
      </h2>
      <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
        {editable && (
          <div
            className="flex items-center justify-center border-2 border-dashed border-blue-400 rounded-lg h-32 cursor-pointer hover:bg-blue-50 transition"
            onClick={onAddPet}
          >
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
        )}
        {pets.length > 0 ? (
          pets.map(pet => (
            <div key={pet.id} className="relative group rounded-lg overflow-hidden shadow-md cursor-pointer h-32">
              <img
                src={pet.profile_path || 'https://via.placeholder.com/150'}
                alt={pet.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity p-1">
                {pet.name}
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-3 text-gray-500">Este usuario aún no tiene mascotas.</p>
        )}
      </div>
    </section>
  );
}

function AddPetModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [profilePath, setProfilePath] = useState('');
  const handleSubmit = () => {
    const newPet = { id: Date.now(), name, profile_path: profilePath, photos: [] };
    onAdd(newPet);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
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