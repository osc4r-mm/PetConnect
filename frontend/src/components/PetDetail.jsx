import React, { useState, useEffect } from 'react';
import { 
  Heart, PawPrint, Mars, Venus, Calendar, Clock, Award, 
  VolumeX, Zap, Volume2, Ruler, ArrowLeft, User, Phone, 
  Mail, MapPin, ImagePlus, Check, X
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPet, adoptPet, requestPetSitting } from '../services/petService';

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [showSittingModal, setShowSittingModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPet(id)
      .then(data => {
        setPet(data);
        document.title = `${data.name} | Mascotitas`;
      })
      .catch(error => {
        console.error("Error fetching pet details:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Nombre requerido";
    if (!formData.email.trim()) errors.email = "Email requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email inválido";
    if (!formData.phone.trim()) errors.phone = "Teléfono requerido";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (type) => {
    if (!validateForm()) return;
    
    setFormSubmitting(true);
    
    const submitFunction = type === 'adopt' ? adoptPet : requestPetSitting;
    
    submitFunction(id, formData)
      .then(() => {
        setFormSuccess(true);
        setTimeout(() => {
          setShowAdoptModal(false);
          setShowSittingModal(false);
          setFormSuccess(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            message: ''
          });
        }, 2000);
      })
      .catch(error => {
        console.error(`Error ${type === 'adopt' ? 'adopting' : 'requesting sitting for'} pet:`, error);
        setFormErrors({ submit: "Ha ocurrido un error. Inténtalo de nuevo." });
      })
      .finally(() => {
        setFormSubmitting(false);
      });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!pet) {
    return <NotFound />;
  }

  // Prepare photo array - profile photo plus additional photos
  const allPhotos = [
    pet.profile_path,
    ...(pet.photos?.map(p => p.path) || [])
  ];

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatAge = (age) => {
    if (age === null || age === undefined) return null;
    return age === 1 ? '1 año' : `${age} años`;
  };

  const formatWeight = (weight) => {
    if (weight == null) return null;
    const valueStr = weight.toString().replace(/\.0+$/, '');
    return `${valueStr} kg`;
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Botón atrás */}
      <div className="container mx-auto px-4 pt-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-all duration-300"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Volver a resultados</span>
        </button>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cabecera con nombre y disponibilidad */}
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
                <div 
                  className={`p-1.5 rounded-full ${pet.gender.name?.toLowerCase()?.includes('macho') ? 'bg-blue-400' : 'bg-pink-400'}`}
                >
                  {pet.gender.name?.toLowerCase()?.includes('macho') ? 
                    <Mars size={24} className="text-white" /> : 
                    <Venus size={24} className="text-white" />
                  }
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
              {formatAge(pet.age) && (
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {formatAge(pet.age)}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8">
            {/* Columna izquierda: fotos */}
            <div className="md:col-span-2">
              <div className="relative rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center" style={{height: '400px'}}>
                {allPhotos.length > 0 ? (
                  <img 
                    src={allPhotos[activePhoto]} 
                    alt={`${pet.name} - foto ${activePhoto + 1}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 h-full">
                    <ImagePlus size={48} />
                    <p className="mt-2">Sin fotografías disponibles</p>
                  </div>
                )}
              </div>
              
              {/* Miniaturas */}
              {allPhotos.length > 1 && (
                <div className="flex overflow-x-auto space-x-2 pb-2">
                  {allPhotos.map((photo, index) => (
                    <div 
                      key={index}
                      onClick={() => setActivePhoto(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${index === activePhoto ? 'ring-2 ring-blue-500' : 'opacity-70'}`}
                    >
                      <img src={photo} alt={`${pet.name} - miniatura ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Descripción */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Acerca de {pet.name}</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {pet.description || `¡Hola! Soy ${pet.name} ${pet.gender?.name?.toLowerCase()?.includes('macho') ? 'y estoy buscando' : 'y estoy buscando'} un hogar lleno de amor. Me encanta jugar, recibir mimos y hacer nuevos amigos. ¿Quieres conocerme?`}
                </p>
              </div>
              
              {/* Datos del dueño */}
              <div className="mt-8 bg-blue-50 rounded-lg p-5">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <User size={20} className="mr-2 text-blue-600" />
                  Información de contacto
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <User className="mr-2 text-blue-600 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium">Propietario</p>
                      <p className="text-gray-700">María López</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="mr-2 text-blue-600 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-gray-700">+34 612 345 678</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="mr-2 text-blue-600 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-700">maria.lopez@example.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="mr-2 text-blue-600 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-gray-700">Madrid, España</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Columna derecha: características y botones */}
            <div className="md:col-span-1">
              {/* Características */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h2 className="text-lg font-semibold mb-4">Características</h2>
                
                <div className="space-y-4">
                  {pet.size && (
                    <div className="flex items-center">
                      <Ruler size={20} className="text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">Tamaño</p>
                        <p className="text-gray-700">{pet.size.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {pet.weight && (
                    <div className="flex items-center">
                      <Award size={20} className="text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">Peso</p>
                        <p className="text-gray-700">{formatWeight(pet.weight)}</p>
                      </div>
                    </div>
                  )}
                  
                  {pet.activity_level && (
                    <div className="flex items-center">
                      <Zap size={20} className="text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">Nivel de actividad</p>
                        <p className="text-gray-700">{pet.activity_level.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {pet.noise_level && (
                    <div className="flex items-center">
                      {pet.noise_level.name?.toLowerCase()?.includes('bajo') ? (
                        <VolumeX size={20} className="text-blue-600 mr-3" />
                      ) : pet.noise_level.name?.toLowerCase()?.includes('medio') ? (
                        <Volume2 size={20} className="text-blue-600 mr-3" />
                      ) : (
                        <Volume2 size={20} className="text-blue-600 mr-3" />
                      )}
                      <div>
                        <p className="font-medium">Nivel de ruido</p>
                        <p className="text-gray-700">{pet.noise_level.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {pet.registered_at && (
                    <div className="flex items-center">
                      <Clock size={20} className="text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">Registrado desde</p>
                        <p className="text-gray-700">{formatDate(pet.registered_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="space-y-4">
                {pet.for_adoption && (
                  <button 
                    onClick={() => setShowAdoptModal(true)}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    <Heart size={20} className="mr-2" />
                    Solicitar adopción
                  </button>
                )}
                
                {pet.for_sitting && (
                  <button 
                    onClick={() => setShowSittingModal(true)}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <PawPrint size={20} className="mr-2" />
                    Solicitar cuidado
                  </button>
                )}
                
                <button 
                  className="w-full py-3 border border-blue-500 text-blue-600 rounded-lg flex items-center justify-center font-medium hover:bg-blue-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <Mail size={20} className="mr-2" />
                  Contactar dueño
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de adopción */}
      {showAdoptModal && (
        <Modal 
          title="Solicitar adopción" 
          onClose={() => setShowAdoptModal(false)}
          icon={<Heart size={24} className="text-red-500" />}
          type="adopt"
          pet={pet}
          formData={formData}
          formErrors={formErrors}
          formSubmitting={formSubmitting}
          formSuccess={formSuccess}
          handleInputChange={handleInputChange}
          handleSubmit={() => handleSubmit('adopt')}
        />
      )}

      {/* Modal de cuidado */}
      {showSittingModal && (
        <Modal 
          title="Solicitar cuidado" 
          onClose={() => setShowSittingModal(false)}
          icon={<PawPrint size={24} className="text-blue-500" />}
          type="sitting"
          pet={pet}
          formData={formData}
          formErrors={formErrors}
          formSubmitting={formSubmitting}
          formSuccess={formSuccess}
          handleInputChange={handleInputChange}
          handleSubmit={() => handleSubmit('sitting')}
        />
      )}
    </div>
  );
}

function Modal({ 
  title, onClose, icon, type, pet, 
  formData, formErrors, formSubmitting, formSuccess,
  handleInputChange, handleSubmit 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {icon}
              <h3 className="text-xl font-bold ml-2">{title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          {formSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">¡Solicitud enviada!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Gracias por tu interés en {pet.name}. El dueño se pondrá en contacto contigo pronto.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                {type === 'adopt' 
                  ? `Estás a punto de solicitar la adopción de ${pet.name}. Por favor, completa el formulario y el dueño se pondrá en contacto contigo.`
                  : `Estás a punto de solicitar el cuidado de ${pet.name}. Por favor, completa el formulario y el dueño se pondrá en contacto contigo.`
                }
              </p>
              
              <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tu nombre"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="tu@email.com"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+34 612 345 678"
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje (opcional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder={`Cuéntanos por qué te gustaría ${type === 'adopt' ? 'adoptar' : 'cuidar'} a ${pet.name}`}
                  />
                </div>
                
                {formErrors.submit && <p className="text-red-500 text-sm">{formErrors.submit}</p>}
                
                <div className="flex space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className={`flex-1 py-2 bg-gradient-to-r ${
                      type === 'adopt' 
                        ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                        : 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    } text-white rounded-md flex items-center justify-center`}
                  >
                    {formSubmitting ? (
                      <span className="animate-pulse">Enviando...</span>
                    ) : (
                      <>
                        <span>Enviar solicitud</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 animate-spin">
          <PawPrint className="absolute top-0 animate-bounce text-blue-900" size={20} />
          <PawPrint className="absolute top-0 right-0 animate-bounce text-red-900" size={20} />
          <PawPrint className="absolute bottom-0 animate-bounce text-yellow-900" size={20} />
          <PawPrint className="absolute bottom-0 right-0 animate-bounce text-green-900" size={20} />
        </div>
        <p className="mt-4 text-lg font-medium text-blue-700">Cargando información de la mascota...</p>
      </div>
    </div>
  );
}

function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
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
}