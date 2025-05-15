import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUserLocation } from '../services/userService';
import authService from '../services/authService';
import { searchCities } from '../services/geoService';
import { User, Calendar, Plus, X, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // ejemplo de icono redondo
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

  useEffect(() => {
    authService.fetchUser()
      .then(data => setCurrentUser(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (id && currentUser && +id === currentUser.id) {
      navigate('/profile', { replace: true });
      return;
    }
    setLoading(true);
    const fetcher = id ? getUserById(id) : authService.fetchUser();
    fetcher
      .then(data => setUser(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, currentUser, navigate]);

  const updateLocation = async (lat, lng) => {
    if (!currentUser || user.id !== currentUser.id) return;
    try {
      // actualizamos usando endpoint PUT /user/{id}
      const updated = await updateUserLocation(user.id, { latitude: lat, longitude: lng });
      setUser(prev => ({ ...prev, latitude: updated.latitude, longitude: updated.longitude }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Cargando usuario...</p>;
  if (!user) return <p>Usuario no encontrado</p>;

  const editable = !id || (currentUser && user.id === currentUser.id);

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
            editable={editable}
            onUpdate={updateLocation}
          />
        </div>
      </div>
      {user.role?.name === 'caregiver' && <ScheduleSection />}
      <PetsSection
        pets={user.pets || []}
        onAddPet={() => setShowAddPetModal(true)}
        editable={editable}
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
      <p><strong>Nombre:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Rol:</strong> {user.role?.name}</p>
    </section>
  );
}

function MapSection({ latitude, longitude, editable, onUpdate }) {
  const [position, setPosition] = useState([latitude || 0, longitude || 0]);
  const [searchTerm, setSearchTerm] = useState('');
  const mapRef = useRef(null);

  function MapEventsHandler() {
    useMapEvents({
      dblclick: e => {
        if (!editable) return;
        const { lat, lng } = e.latlng;
        if (window.confirm(`¿Actualizar ubicación a [${lat.toFixed(4)}, ${lng.toFixed(4)}]?`)) {
          setPosition([lat, lng]);
          onUpdate(lat, lng);
        }
      }
    });
    return null;
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`
      );
      const results = await res.json();
      if (results.length > 0) {
        const { lat, lon } = results[0];
        const nLat = parseFloat(lat);
        const nLng = parseFloat(lon);
        setPosition([nLat, nLng]);
        mapRef.current?.setView([nLat, nLng], 13);
        if (editable) onUpdate(nLat, nLng);
      } else {
        alert('No se encontró esa ciudad.');
      }
    } catch (err) {
      console.error(err);
      alert('Error buscando la ciudad.');
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Search className="mr-2 text-blue-600" /> Ubicación en el mapa
      </h2>
      <div className="flex mb-2 space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar ciudad..."
          className="border p-2 rounded-md flex-1"
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >Buscar</button>
      </div>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="h-64 w-full rounded-lg mb-2"
        whenCreated={map => { mapRef.current = map }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEventsHandler />
        <Marker
          position={position}
          icon={customIcon}
          draggable={editable}
          eventHandlers={{
            dragend: e => {
              const { lat, lng } = e.target.getLatLng();
              setPosition([lat, lng]);
              onUpdate(lat, lng);
            }
          }}
        >
          <Popup>Arrastra o haz doble clic para cambiar ubicación</Popup>
        </Marker>
      </MapContainer>
      {editable && <p className="text-sm text-gray-500">Puedes acercar/alejar con la rueda del ratón.</p>}
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
