import React, { useState, useEffect } from 'react';
import { 
  Heart, PawPrint, Mars, Venus, ArrowLeft,
  Mail, Check, X, Award, Briefcase, Camera, Calendar
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPet, request, getOwner } from '../../services/petService';
import { LoadingScreen, NotFoundData } from '../Util';
import { useAuth } from '../../context/AuthContext';

// Importar componentes parciales
import PhotoGallery from './partials/PhotoGallery';
import OwnerCard from './partials/OwnerCard';
import PetCharacteristics from './partials/PetCharacteristics';

// Componente para el modal de adopción/cuidado
const RequestModal = ({ pet, onClose, isOpen, initialType }) => {
  const [formData, setFormData] = useState({ 
    message: '',
    type: initialType
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = () => {
    // No hay validación para mensaje, puede estar vacío
    setFormSubmitting(true);
    
    request(pet.id, formData)
      .then(() => {
        setFormSuccess(true);
        setTimeout(() => {
          onClose();
          setFormSuccess(false);
        }, 2000);
      })
      .catch(err => {
        console.error("Error al enviar solicitud:", err);
        setFormErrors({...formErrors, submit: 'Ocurrió un error al enviar la solicitud'});
      })
      .finally(() => setFormSubmitting(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold mb-4">
          {formData.type === 'adoption' ? 'Solicitar adopción' : 'Solicitar cuidado'}
        </h2>
        
        {formSuccess ? (
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 p-2 rounded-full bg-green-100">
              <Check size={32} className="text-green-600" />
            </div>
            <p className="text-center text-green-600 font-medium">¡Solicitud enviada con éxito!</p>
            <p className="text-center text-gray-500 mt-1">El propietario revisará tu solicitud pronto.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6">
              Estás por solicitar {formData.type === 'adoption' ? 'la adopción' : 'el cuidado'} de <strong>{pet.name}</strong>. 
              Escribe un mensaje para el dueño explicando por qué estás interesado.
            </p>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mensaje (opcional)</label>
                <textarea
                  name="message"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={`Hola, me interesa ${formData.type === 'adoption' ? 'adoptar' : 'cuidar'} a ${pet.name}...`}
                ></textarea>
              </div>
              
              {formErrors.submit && (
                <p className="text-sm text-red-500">{formErrors.submit}</p>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
                >
                  {formSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// Helpers para formatear datos
const formatHelpers = {
  age: (months) => {
    if (!months) return null;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years > 0) {
      return remainingMonths > 0 
        ? `${years} año${years > 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`
        : `${years} año${years > 1 ? 's' : ''}`;
    }
    return `${months} mes${months > 1 ? 'es' : ''}`;
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
  const [requestType, setRequestType] = useState('adoption');
  const [notFound, setNotFound] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Verificar si el usuario actual es el dueño
  const isOwner = currentUser && owner && currentUser.id === owner.id;
  
  // Obtener mascota y su dueño al cargar
  useEffect(() => {
    const fetchPetAndOwner = async () => {
      try {
        const petData = await getPet(id);
        setPet(petData);
        
        // Luego de obtener la mascota, obtenemos su dueño
        const ownerData = await getOwner(petData.user_id);
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

  const genderIsMale = pet.gender?.name?.toLowerCase() === 'macho';
  const genderIcon = genderIsMale 
    ? <Mars size={16} className="text-white" />
    : <Venus size={16} className="text-white" />;

  return (
    <div className="bg-white min-h-screen">
      {/* Modal de adopción/cuidado */}
      <RequestModal 
        pet={pet}
        onClose={() => setShowRequestModal(false)}
        isOpen={showRequestModal}
        initialType={requestType}
      />
      
      {/* Página de detalle */}
      <div className="container mx-auto pb-12">
        {/* Botón para regresar */}
        <div className="p-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-1" /> Volver
          </button>
        </div>
        
        {/* Encabezado con el fondo de color */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 md:p-8 rounded-t-xl shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {pet.for_adoption && (
                <div className="bg-red-500 bg-opacity-80 p-2 rounded-full" title="Disponible para adopción">
                  <Heart size={24} className="text-white" />
                </div>
              )}
              {pet.for_sitting && (
                <div className="bg-blue-500 bg-opacity-80 p-2 rounded-full" title="Disponible para cuidado">
                  <PawPrint size={24} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <h1 className="text-3xl md:text-4xl font-bold mr-3">{pet.name}</h1>
              {pet.gender && (
                <div className={`p-1.5 rounded-full ${genderIsMale ? 'bg-blue-400' : 'bg-pink-400'}`}>
                  {genderIcon}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
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
                {pet.description || `¡Hola! Soy ${pet.name} ${genderIsMale ? 'y estoy buscando' : 'y estoy buscando'} un hogar lleno de amor. Me encanta jugar, recibir mimos y hacer nuevos amigos. ¿Quieres conocerme?`}
              </p>
            </div>
          </div>
          
          {/* Columna derecha: características y botones */}
          <div className="md:col-span-1">
            {/* Características */}
            <PetCharacteristics pet={pet} formatHelpers={formatHelpers} />
            
            {/* Sección del dueño */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Contactar con el dueño</h3>
              <OwnerCard owner={owner} />
            </div>
            
            {/* Botones de acción */}
            <div className="mt-8 space-y-4">
              {!isOwner && (
                <>
                  {pet.for_adoption && (
                    <button
                      onClick={() => openRequestModal('adoption')}
                      className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      <Heart size={18} className="mr-2" /> Solicitar adopción
                    </button>
                  )}
                  {pet.for_sitting && (
                    <button
                      onClick={() => openRequestModal('sitting')}
                      className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      <Briefcase size={18} className="mr-2" /> Solicitar cuidado
                    </button>
                  )}
                </>
              )}

              {/* Opciones para el dueño de la mascota */}
              {isOwner && (
                <div className="space-y-3">
                  <h3 className="font-medium">Opciones de gestión</h3>
                  <button
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Camera size={18} className="mr-2" />
                    Gestionar fotos
                  </button>
                  {/* Otros botones de gestión pueden ir aquí */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;