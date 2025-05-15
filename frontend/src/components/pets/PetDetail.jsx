import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, PawPrint, Mars, Venus, Calendar, Clock, 
  VolumeX, Zap, Volume2, Ruler, ArrowLeft,
  Mail, ImagePlus, Check, X, Award, Briefcase
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPet, request, getOwner } from '../../services/petService';
import { LoadingScreen, NotFoundData } from '../Util';

// Componentes más pequeños y reutilizables
const CharacteristicItem = ({ icon, title, value }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center">
      {icon}
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-gray-700">{value}</p>
      </div>
    </div>
  );
};

const PhotoGallery = ({ photos, profilePath, name }) => {
  const [activePhoto, setActivePhoto] = useState(0);
  
  // Crear un array con todas las imágenes disponibles
  const allPhotos = useMemo(() => {
    // Primero incluimos la foto de perfil si existe
    const images = profilePath ? [profilePath] : [];
    
    // Luego añadimos las fotos adicionales, verificando que estamos accediendo correctamente a image_path
    if (photos && photos.length > 0) {
      photos.forEach(photo => {
        if (photo.image_path) {
          images.push(photo.image_path);
        }
      });
    }
    
    return images;
  }, [profilePath, photos]);
  
  // Si no hay fotos, mostramos un placeholder
  if (allPhotos.length === 0) {
    return (
      <div className="relative rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center" style={{height: '400px'}}>
        <div className="flex flex-col items-center justify-center text-gray-400 h-full">
          <ImagePlus size={48} />
          <p className="mt-2">Sin fotografías disponibles</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="relative rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center" style={{height: '400px'}}>
        <img 
          src={allPhotos[activePhoto]} 
          alt={`${name} - foto ${activePhoto + 1}`} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {allPhotos.length > 1 && (
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {allPhotos.map((photoUrl, index) => (
            <div 
              key={index}
              onClick={() => setActivePhoto(index)}
              className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${index === activePhoto ? 'ring-2 ring-blue-500' : 'opacity-70'}`}
            >
              <img src={photoUrl} alt={`${name} - miniatura ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// Componente para el modal de adopción
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
          setFormData({ message: '', type: 'adopt' });
        }, 2000);
      })
      .catch(error => {
        console.error('Error al enviar solicitud:', error);
        setFormErrors({ submit: 'Ha ocurrido un error. Inténtalo de nuevo.' });
      })
      .finally(() => setFormSubmitting(false));
  };

  useEffect(() => {
  if (isOpen) {
    setFormData({ message: '', type: initialType });
    setFormErrors({});
  }
}, [isOpen, initialType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {formData.type === 'adopt' ? (
              <Heart size={24} className="text-red-500" />
            ) : (
              <PawPrint size={24} className="text-blue-500" />
            )}
            <h3 className="text-xl font-bold ml-2">Nueva solicitud</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {formSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium">¡Solicitud enviada!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Gracias por tu interés en {pet.name}. El dueño se pondrá en contacto contigo pronto.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Para solicitar a {pet.name}, completa el siguiente formulario:
            </p>
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              {/* Selector de tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de solicitud</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {pet.for_adoption && (
                    <option value="adopt">Adoptar</option>
                  )}
                  {pet.for_sitting && (
                    <option value="care">Cuidar</option>
                )}
                </select>
              </div>
              
              {/* Mensaje opcional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje (opcional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder={`Cuéntanos por qué te gustaría ${formData.type === 'adopt' ? 'adoptar' : 'cuidar'} a ${pet.name}`}
                />
              </div>

              {formErrors.submit && <p className="text-red-500 text-sm">{formErrors.submit}</p>}

              <div className="flex justify-end pt-3 space-x-2">
                <button type="button" onClick={onClose} className="py-2 px-4 border rounded-md text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={formSubmitting}
                  className={`py-2 px-4 text-white rounded-md ${formData.type === 'adopt' ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-opacity-50`}>
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

const ContactCard = ({ owner }) => {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm p-2 hover:scale-105 transition-transform duration-200 cursor-pointer">
      {/* Foto de perfil */}
      <div className="flex-shrink-0 mr-3">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
          {owner.image ? (
            <img src={owner.image} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">🐶</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Información del dueño */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {owner?.name || "No disponible"}
        </h3>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Mail className="w-3 h-3 mr-1" />
          <span className="truncate">{owner?.email || "No disponible"}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Briefcase className="w-3 h-3 mr-1" />
          <span className="truncate">{owner?.role.name || "Propietario"}</span>
        </div>
      </div>
    </div>
  );
};

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex-1 items-center justify-center bg-gray-100 p-4">
      <div className="text-center">
        <PawPrint size={64} className="mx-auto text-gray-400" />
        <h2 className="mt-4 text-2xl font-bold text-gray-700">Mascota no encontrada</h2>
        <p className="mt-2 text-gray-600">No pudimos encontrar la mascota que estás buscando.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

// Funciones útiles para formatear datos
const formatHelpers = {
  date: (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }) : null;
  },
  age: (age) => {
    if (age == null) return null;
    return age === 1 ? '1 año' : `${age} años`;
  },
  weight: (weight) => {
    if (weight == null) return null;
    return `${weight.toString().replace(/\.0+$/,'')} kg`;
  }
};

// Componente principal
export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('adopt');

  useEffect(() => {
    const fetchPetAndOwner = async () => {
      try {
        setLoading(true);
        const petData = await getPet(id);
        
        // Usar la ID del usuario para obtener datos del dueño
        if (petData && petData.user_id) {
          const ownerData = await getOwner(petData.user_id);
          setOwner(ownerData);
        }
        
        setPet(petData);
        document.title = `${petData.name} | Mascotitas`;
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

  if (loading) 
    return <LoadingScreen 
      message={'Cargando informacion de la mascota...'} />;
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
        message2="Ha ocurrido un error. Inténtalo de nuevo más tarde."
        icon={Zap}
        redirectUrl="/"
        redirectMessage="Volver al inicio"
      />
    );

  // Determinar ícono de género
  const genderIsMale = pet.gender?.name?.toLowerCase()?.includes('macho');
  const genderIcon = genderIsMale ? 
    <Mars size={24} className="text-white" /> : 
    <Venus size={24} className="text-white" />;
  
  // Determinar ícono de nivel de ruido
  const getNoiseIcon = () => {
    const noiseLevel = pet.noise_level?.name?.toLowerCase() || '';
    if (noiseLevel.includes('bajo')) return <VolumeX size={20} className="text-blue-600 mr-3" />;
    return <Volume2 size={20} className="text-blue-600 mr-3" />;
  };

  return (
    <div className="pb-12">
      {/* Navegación */}
      <div className="container mx-auto px-4 pt-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-all duration-300"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Volver a resultados</span>
        </button>
      </div>
      
      {/* Contenido principal */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cabecera */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 md:p-8 text-white relative">
            <div className="absolute top-4 right-4 flex space-x-3">
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
          
          {/* Contenido principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8">
            {/* Columna izquierda: fotos y descripción */}
            <div className="md:col-span-2">
              {/* Aquí está el cambio clave - Pasamos la foto de perfil y las fotos adicionales como props separadas */}
              <PhotoGallery 
                profilePath={pet.profile_path} 
                photos={pet.photos} 
                name={pet.name} 
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
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h2 className="text-lg font-semibold mb-4">Características</h2>
                
                <div className="space-y-4">
                  <CharacteristicItem 
                    icon={<Ruler size={20} className="text-blue-600 mr-3" />}
                    title="Tamaño"
                    value={pet.size?.name}
                  />
                  
                  <CharacteristicItem 
                    icon={<Award size={20} className="text-blue-600 mr-3" />}
                    title="Peso"
                    value={formatHelpers.weight(pet.weight)}
                  />
                  
                  <CharacteristicItem 
                    icon={<Zap size={20} className="text-blue-600 mr-3" />}
                    title="Nivel de actividad"
                    value={pet.activity_level?.name}
                  />
                  
                  <CharacteristicItem 
                    icon={getNoiseIcon()}
                    title="Nivel de ruido"
                    value={pet.noise_level?.name}
                  />
                  
                  <CharacteristicItem 
                    icon={<Clock size={20} className="text-blue-600 mr-3" />}
                    title="Registrado desde"
                    value={formatHelpers.date(pet.registered_at)}
                  />
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="space-y-4">
                {pet.for_adoption && (
                  <button 
                    onClick={() => openRequestModal('adopt')}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    <Heart size={20} className="mr-2" />
                    Solicitar adopción
                  </button>
                )}
                
                {pet.for_sitting && (
                  <button 
                    onClick={() => openRequestModal('care')}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <PawPrint size={20} className="mr-2" />
                    Solicitar cuidado
                  </button>
                )}
                <ContactCard owner={owner} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de solicitud */}
      <RequestModal 
        pet={pet}
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)}
        initialType={requestType}
      />
    </div>
  );
}