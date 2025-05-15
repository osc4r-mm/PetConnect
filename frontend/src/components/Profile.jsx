import React, { useState, useEffect } from 'react';
import { getUserById, updateUserLocation } from '../services/userService';
import { useParams } from 'react-router-dom';
import { User, MapPin, Calendar, Clock } from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationInput, setLocationInput] = useState('');
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUserById(id)
      .then(data => {
        setUser(data);
        setLocationInput(data.location || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleLocationSave = async () => {
    if (!locationInput.trim()) return;
    setUpdatingLocation(true);
    try {
      const updated = await updateUserLocation(id, locationInput.trim());
      setUser(prev => ({ ...prev, location: updated.location }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingLocation(false);
    }
  };

  if (loading) return <p>Cargando usuario...</p>;
  if (!user) return <p>Usuario no encontrado</p>;

  return (
    <div className="container mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Sección 1: Datos de usuario */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <User className="mr-2 text-blue-600" /> Información de usuario
        </h2>
        <p><strong>Nombre:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.role?.name}</p>
      </section>

      {/* Sección 2: Ubicación */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <MapPin className="mr-2 text-blue-600" /> Ubicación
        </h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={locationInput}
            onChange={e => setLocationInput(e.target.value)}
            className="border p-2 rounded-md flex-1"
            placeholder="Ingresa tu ubicación"
          />
          <button
            onClick={handleLocationSave}
            disabled={updatingLocation}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {updatingLocation ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
        {user.location && <p className="mt-2">Ubicación actual: {user.location}</p>}
      </section>

      {/* Sección 3: Horario (solo cuidadores) */}
      {user.role?.name === 'caregiver' && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 text-blue-600" /> Horario semanal
          </h2>
          <div className="overflow-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Hora/Día</th>
                  {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                    <th key={d} className="border p-2">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 24*4 }).map((_, i) => {
                  const hour = Math.floor(i/4);
                  const minutes = (i%4) * 15;
                  const label = `${hour.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
                  return (
                    <tr key={i}>
                      <td className="border p-1 text-xs">{label}</td>
                      {Array(7).fill().map((_, j) => (
                        <td key={j} className="border p-1">
                          {/* aquí podrías añadir lógica para marcar disponibilidad */}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
