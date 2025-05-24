import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { searchCities } from '../../../services/geoService';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function MapSection({ latitude, longitude, editable, onUpdate }) {
  const [viewPosition, setViewPosition] = useState([latitude || 0, longitude || 0]);
  const [markerPosition, setMarkerPosition] = useState([latitude || 0, longitude || 0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);
  const debounceRef = useRef();
  const dropdownRef = useRef(null);

  // Actualiza la vista del mapa cuando cambia la posición de vista
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(viewPosition, mapRef.current.getZoom());
    }
  }, [viewPosition]);

  // Maneja el cierre del dropdown de resultados al hacer click fuera
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

  // Busca ciudades con debounce al escribir
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      debounceRef.current = setTimeout(async () => {
        const cities = await searchCities(searchTerm);
        setSearchResults(cities);
        setShowDropdown(cities.length > 0);
        setIsSearching(false);
      }, 300);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Handler de eventos del mapa (doble click para actualizar ubicación)
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

  // Cuando se selecciona una ciudad del buscador, se centra el mapa en esa ciudad
  const handleSelectCity = (city) => {
    const lat = parseFloat(city.lat);
    const lng = parseFloat(city.lon);
    setViewPosition([lat, lng]);
    mapRef.current?.setView([lat, lng], 13);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Si cambian las props de latitud/longitud, se actualiza la vista y el marcador
  useEffect(() => {
    if (latitude && longitude) {
      setViewPosition([latitude, longitude]);
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
      }
    }
  }, [latitude, longitude]);

  return (
    <section className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-100 shadow mb-6">
      <h2 className="text-2xl font-semibold mb-4 flex items-center text-green-700">
        <Search className="mr-2 text-blue-600" /> Ubicación en el mapa
      </h2>
      <div className="flex mb-2 relative" ref={dropdownRef}>
        <div className='relative flex-1'>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar ciudad..."
            className="border border-green-200 p-2 rounded-l-md w-full pr-8 bg-white focus:ring-2 focus:ring-green-400 outline-none"
          />
          {isSearching && (
            <span className="absolute right-2 top-2 animate-spin text-gray-400">
              ⟳
            </span>
          )}
        </div>
        {showDropdown && (
          <ul className="absolute z-20 w-full top-10 bg-white border border-green-200 rounded-md mt-1 max-h-60 overflow-auto shadow">
            {searchResults.map((city,i) => (
              <li key={i} className="p-2 hover:bg-blue-50 cursor-pointer flex items-center"
                  onClick={() => handleSelectCity(city)}>
                <MapPin size={16} className="mr-2 text-blue-500" />
                <span>{city.name}, <small className="text-gray-500">{city.country}</small></span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative rounded-lg overflow-hidden shadow" style={{ zIndex: 0 }}>
        <MapContainer
          key={viewPosition.join(',')}
          center={viewPosition}
          zoom={13}
          scrollWheelZoom={true}
          className="h-64 w-full rounded-lg mb-2"
          whenCreated={map => (mapRef.current = map)}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {editable && <MapEventsHandler />}
          <Marker position={markerPosition} icon={customIcon} draggable={editable}
            eventHandlers={editable ? {
              dragend: e => {
                const { lat, lng } = e.target.getLatLng();
                setMarkerPosition([lat, lng]); onUpdate(lat, lng);
              }
            } : {}}
          >
            <Popup>{editable ? 'Actualiza la ubicación' : 'Ubicación'}</Popup>
          </Marker>
        </MapContainer>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        {editable
          ? 'Puedes acercar/alejar con la rueda del ratón y actualizar la ubicación arrastrando el marcador o haciendo doble clic.'
          : 'Solo puedes ver la ubicación.'}
      </p>
    </section>
  );
}