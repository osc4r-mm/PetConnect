import React, { useState, useEffect } from 'react';
import { 
  Heart, PawPrint, Mars, Venus, ArrowLeft,
  Mail, Check, X, Award, Briefcase, Calendar
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPet, request, getOwner } from '../../services/petService';
import { LoadingScreen, NotFoundData } from '../Util';
import { useAuth } from '../../context/AuthContext';

// Importar componentes parciales
import PhotoGallery from './partials/PhotoGallery';
import OwnerCard from './partials/OwnerCard';
import PetCharacteristics from './partials/PetCharacteristics';
import RequestForm from './partials/RequestForm';

// Helpers para formatear datos
const formatHelpers = {
  age: (age) => {
    if (!age) return null;
    
    // Si es un número entero o decimal, asumimos que son años
    if (!isNaN(age)) {
      const years = parseInt(age);
      const remainingMonths = Math.round((age - years) * 12);
      
      if (years > 0) {
        return remainingMonths > 0 
          ? `${years} año${years > 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`
          : `${years} año${years > 1 ? 's' : ''}`;
      } else if (remainingMonths > 0) {
        return `${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`;
      }
      
      // Si llegamos aquí, es solo un año
      return `${years} año${years > 1 ? 's' : ''}`;
    }
    
    return `${age}`;
  },
  date: (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

// Componente principal
const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [pet, setPet] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('adopt');
  const [notFound, setNotFound] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Obtener mascota y su dueño al cargar
  useEffect(() => {
    const fetchPetAndOwner = async () => {
      try {
        const petData = await getPet(id);
        console.log("Pet data:", petData);
        setPet(petData);
        
        // Luego de obtener la mascota, obtenemos su dueño
        const ownerData = await getOwner(petData.id);
        console.log("Owner data:", ownerData);
        setOwner(ownerData);
      } catch (err) {
        console.error('Error cargando datos:', err);
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setHasError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPetAndOwner();
  }, [id]);

  // Función para abrir el modal con tipo preseleccionado
  const openRequestModal = (type) => {
    console.log(`Abriendo modal para ${type}`);
    setRequestType(type);
    setShowRequestModal(true);
  };

  // Manejar actualizaciones de fotos
  const handlePhotosUpdate = (type, data) => {
    if (type === 'thumbnail') {
      // Actualizar la miniatura principal
      setPet(prevPet => ({
        ...prevPet,
        profile_path: data
      }));
    } 
    else if (type === 'extra') {
      // Añadir una nueva foto a las extras
      setPet(prevPet => ({
        ...prevPet,
        photos: [...(prevPet.photos || []), data]
      }));
    }
    else if (type === 'delete') {
      // Eliminar una foto por su ID
      setPet(prevPet => ({
        ...prevPet,
        photos: (prevPet.photos || []).filter(photo => photo.id !== data)
      }));
    }
  };

  if (loading) 
    return <LoadingScreen message={'Cargando información de la mascota...'} />;
  if (notFound) 
    return (
      <NotFoundData
        message1="Mascota no encontrada"
        message2="Lo sentimos, esa mascota no existe."
        icon={PawPrint}
        redirectUrl="/"
      />
    );
  if (hasError)
    return (
      <NotFoundData
        message1="Error cargando mascota"
        message2="Ha ocurrido un problema al cargar la información."
        icon={PawPrint}
        redirectUrl="/"
      />
    );

  // Verificar si el usuario actual es el dueño (después de cargar los datos)
  const isOwner = currentUser && owner && currentUser.id === owner.id;
  
  const genderIsMale = pet.gender?.name?.toLowerCase() === 'macho';
  const genderIcon = genderIsMale 
    ? <Mars size={16} className="text-white" />
    : <Venus size={16} className="text-white" />;

  // Usar directamente las propiedades como booleanos
  const isForAdoption = pet.for_adoption === true;
  const isForSitting = pet.for_sitting === true;

  return (
    <div className="bg-white min-h-screen">
      {/* Modal de adopción/cuidado */}
      <RequestForm 
        pet={pet}
        onClose={() => setShowRequestModal(false)}
        isOpen={showRequestModal}
        initialType={requestType}
        isForAdoption={isForAdoption}
        isForSitting={isForSitting}
      />
      
      {/* Página de detalle */}
      <div className="container mx-auto pb-12">
        {/* Botón para regresar */}
        <div className="p-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft size={20} className="mr-1" /> Volver
          </button>
        </div>
        
        {/* Encabezado con el fondo de color - CAMBIADO A MORADO PARA MEJOR CONTRASTE */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 md:p-8 rounded-t-xl shadow-md relative">
          {/* Iconos de disponibilidad en posición absoluta */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {isForAdoption && (
              <div className="bg-red-500 p-2 rounded-full shadow-md" title="Disponible para adopción">
                <Heart size={24} className="text-white" />
              </div>
            )}
            {isForSitting && (
              <div className="bg-blue-500 p-2 rounded-full shadow-md" title="Disponible para cuidado">
                <PawPrint size={24} className="text-white" />
              </div>
            )}
          </div>

          {/* Contenido reorganizado del encabezado */}
          <div className="flex flex-col">
            <div className="flex items-center mb-3">
              <h1 className="text-3xl md:text-4xl font-bold mr-3">{pet.name}</h1>
              {pet.gender && (
                <div className={`p-1.5 rounded-full ${genderIsMale ? 'bg-blue-400' : 'bg-pink-400'}`}>
                  {genderIcon}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {pet.species?.name && (
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                  {pet.species.name}
                </span>
              )}
              {pet.breed?.name && (
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                  {pet.breed.name}
                </span>
              )}
              {formatHelpers.age(pet.age) && (
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {formatHelpers.age(pet.age)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8">
          {/* Columna izquierda: fotos y descripción */}
          <div className="md:col-span-2">
            <PhotoGallery 
              profilePath={pet.profile_path} 
              photos={pet.photos} 
              name={pet.name}
              editable={isOwner}
              petId={pet.id}
              onPhotosUpdate={handlePhotosUpdate}
            />
            
            {/* Descripción */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Acerca de {pet.name}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {pet.description || `¡Hola! Soy ${pet.name} ${genderIsMale ? 'y estoy buscando' : 'y estoy buscando'} un hogar lleno de amor. Me encanta jugar, recibir mimos y hacer nuevos amigos. ¿Te gustaría conocerme?`}
              </p>
            </div>
          </div>
          
          {/* Columna derecha: características y botones */}
          <div className="md:col-span-1">
            {/* Características */}
            <PetCharacteristics pet={pet} formatHelpers={formatHelpers} />
            
            {/* Botones de acción - MODIFICADOS PARA ASEGURAR VISIBILIDAD */}
            <div className="mt-8 space-y-4">
              {/* IMPORTANTE: Mostramos los botones si el usuario está conectado y no es el dueño */}
              {currentUser && !isOwner && (
                <>
                  {/* Botón de adopción */}
                  {isForAdoption && (
                    <button
                      onClick={() => openRequestModal('adopt')}
                      className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      <Heart size={18} className="mr-2" /> Solicitar adopción
                    </button>
                  )}
                  
                  {/* Botón de cuidado */}
                  {isForSitting && (
                    <button
                      onClick={() => openRequestModal('care')}
                      className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      <Briefcase size={18} className="mr-2" /> Solicitar cuidado
                    </button>
                  )}
                </>
              )}

              {/* Si el usuario no está conectado pero la mascota está disponible */}
              {!currentUser && (isForAdoption || isForSitting) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-700">
                    Debes iniciar sesión para solicitar adopción o cuidado
                  </p>
                </div>
              )}

              {/* Si el usuario es el dueño */}
              {currentUser && isOwner && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-blue-700">
                    Esta es tu mascota
                  </p>
                </div>
              )}
            </div>
            
            {/* Sección del dueño */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Contactar con el dueño</h3>
              <OwnerCard owner={owner} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;