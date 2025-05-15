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
  const dropdownRef = useRef(null);
  let debounce;

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(viewPosition);
    }
  }, [viewPosition]);

  useEffect(() => {
    clearTimeout(debounce);
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      debounce = setTimeout(async () => {
        const cities = await searchCities(searchTerm);
        setSearchResults(cities);
        setShowDropdown(cities.length > 0);
        setIsSearching(false);
      }, 300);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
    return () => clearTimeout(debounce);
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
    const lat = parseFloat(city.lat);
    const lng = parseFloat(city.lon);
    setViewPosition([lat, lng]);
    mapRef.current?.setView([lat, lng], 13);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Search className="mr-2 text-blue-600" /> Ubicación en el mapa
      </h2>
      <div className="flex mb-2 relative" ref={dropdownRef}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar ciudad..."
          className="border p-2 rounded-l-md flex-1"
          disabled={!editable}
        />
        <button
          onClick={() => searchResults[0] && handleSelectCity(searchResults[0])}
          className={`px-4 py-2 rounded-r-md ${editable ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}
          disabled={!editable}
        >Buscar</button>
        {isSearching && <span className="absolute right-12 top-2 animate-spin">⟳</span>}
        {showDropdown && (
          <ul className="absolute z-20 w-full bg-white border rounded-md mt-1 max-h-60 overflow-auto">
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
      <div className="relative" style={{ zIndex: 0 }}>
        <MapContainer
          center={viewPosition}
          zoom={13}
          whenCreated={map => (mapRef.current = map)}
          className="h-64 w-full rounded-lg mb-2"
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
      <p className="text-sm text-gray-500">
        {editable
          ? 'Arrastra el marcador o haz doble clic para actualizar.'
          : 'Esta ubicación no es editable.'}
      </p>
    </section>
  );
}