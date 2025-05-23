import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUser, updateUser, getPetsFromUser } from '../../services/userService';
import { isCaregiver } from '../../services/caregiverService';
import { LoadingScreen, NotFoundData } from '../Util';
import UserInfoSection from './partials/UserInfoSection';
import MapSection from './partials/MapSection';
import ScheduleSection from './partials/ScheduleSection';
import PetsSection from './partials/PetsSection';
import AddPetModal from './partials/AddPetModal';

export default function Profile() {
  const { id: routeId } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);

  const targetId = routeId || currentUser?.id;
  const isOwnProfile = currentUser && Number(targetId) === currentUser.id;

  // Fetch profile data
  useEffect(() => {
    if (authLoading) return;
    if (!targetId) return;

    setLoading(true);
    getUser(targetId)
      .then(data => {
        setUser(data);
        return getPetsFromUser(targetId);
      })
      .then(petsData => {
        setPets(petsData);
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [targetId, authLoading]);

  const handleUpdateLocation = async (lat, lng) => {
    if (!isOwnProfile) return;
    try {
      const updated = await updateUser(currentUser.id, { latitude: lat, longitude: lng });
      setUser(prev => ({ ...prev, latitude: updated.latitude, longitude: updated.longitude }));
    } catch (err) {
      console.error(err);
    }
  };

  // Verificar si el usuario es cuidador
  const userIsCaregiver = isCaregiver(user);

  if (authLoading || loading) return <LoadingScreen message={'Verificando sesión...'} />;
  if (error || !user) return <NotFoundData message1="Usuario no encontrado" message2="No se ha podido acceder al perfil de este usuario" />;

  return (
    <div className="container mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">
      <div className="flex flex-col md:flex-row md:space-x-6">
        <div className='flex-1'>
          <UserInfoSection user={user} />
        </div>
        <div className='flex-1'>
          <MapSection
            latitude={user.latitude}
            longitude={user.longitude}
            editable={isOwnProfile}
            onUpdate={handleUpdateLocation}
          />
        </div>
      </div>

      {/* Mostrar el calendario SOLO si el usuario es cuidador */}
      {userIsCaregiver && (
        <ScheduleSection userId={user.id} isEditable={isOwnProfile} />
      )}

      <PetsSection
        pets={pets || []}
        onAdd={() => setShowAddPetModal(true)}
        editable={isOwnProfile}
      />

      {showAddPetModal && (
        <AddPetModal
          onClose={() => setShowAddPetModal(false)}
          onAdd={newPet => {
            setUser(prev => ({ ...prev, pets: [newPet, ...(prev.pets || [])] }));
            setShowAddPetModal(false);
          }}
        />
      )}
    </div>
  );
}