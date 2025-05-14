import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, PawPrint, ArrowLeft, Mars, Venus, Ruler, 
  Volume2, Zap, Calendar, Info, MapPin, Medal
} from 'lucide-react';
import { getPet, adoptPet, requestPetSitting } from '../services/petService';

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const data = await getPet(id);
        setPet(data);
      } catch (err) {
        console.error("Error fetching pet details:", err);
        setError("No pudimos encontrar esta mascota. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const formatAge = (age) => {
    if (age === null || age === undefined) return "No disponible";
    return age === 1 ? '1 año' : `${age} años`;
  };

  const formatWeight = (weight) => {
    if (weight == null) return "No disponible";
    const valueStr = weight.toString().replace(/\.0+$/, '');
    return `${valueStr} kg`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (type) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      if (type === 'adoption') {
        await adoptPet(id, formData);
      } else {
        await requestPetSitting(id, formData);
      }
      
      setSubmitSuccess(true);
      // Reiniciar el formulario
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: ''
      });
    } catch (err) {
      console.error(`Error submitting ${type} request:`, err);
      setSubmitError(`Ha ocurrido un error al enviar tu solicitud. ${err.message || 'Por favor, intenta de nuevo.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onBack={() => navigate('/')} />;
  if (!pet) return <ErrorState message="No se encontró la mascota" onBack={() => navigate('/')} />;

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      {/* Cabecera con imagen de fondo */}
      <div className="relative h-64 bg-blue-700 overflow-hidden">
        {pet.profile_path && (
          <div className="absolute inset-0">
            <img 
              src={pet.profile_path} 
              alt={pet.name} 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent"></div>
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-white bg-blue-800 bg-opacity-70 px-4 py-2 rounded-full hover:bg-opacity-100 transition-all duration-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver
          </button>
        </div>
        
        <div className="absolute bottom-6 left-6 text-white">
          <div className="flex items-center">
            <h1 className="text-4xl font-bold">{pet.name}</h1>
            {pet.gender && (
              <div className={`ml-4 p-2 rounded-full ${pet.gender.name?.toLowerCase()?.includes('macho') ? 'bg-blue-500' : 'bg-pink-500'}`}>
                {pet.gender.name?.toLowerCase()?.includes('macho') ? 
                  <Mars size={24} /> : 
                  <Venus size={24} />
                }
              </div>
            )}
          </div>
          <div className="flex mt-2">
            {pet.species?.name && (
              <span className="bg-blue-600 bg-opacity-70 px-3 py-1 rounded-full text-sm mr-2">
                {pet.species.name}
              </span>
            )}
            {pet.breed?.name && (
              <span className="bg-blue-600 bg-opacity-70 px-3 py-1 rounded-full text-sm mr-2">
                {pet.breed.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Imagen principal y estado de adopción/cuidado */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-2">
              <img 
                src={pet.profile_path} 
                alt={pet.name} 
                className="w-full h-80 md:h-96 object-cover"
              />
            </div>
            <div className="p-6 bg-gray-50 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Disponible para:</h2>
                <div className="flex flex-col space-y-4">
                  {pet.for_adoption && (
                    <div className="flex items-center p-4 bg-red-100 rounded-lg">
                      <Heart size={24} className="text-red-600 mr-3" />
                      <div>
                        <h3 className="font-bold text-red-800">Adopción</h3>
                        <p className="text-sm text-red-700">Llévame a casa para siempre</p>
                      </div>
                    </div>
                  )}
                  {pet.for_sitting && (
                    <div className="flex items-center p-4 bg-blue-100 rounded-lg">
                      <PawPrint size={24} className="text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-bold text-blue-800">Cuidado Temporal</h3>
                        <p className="text-sm text-blue-700">Cuídame por un tiempo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('info')}
              >
                <Info size={18} className="inline mr-2" />
                Información
              </button>
              {pet.for_adoption && (
                <button
                  className={`py-4 px-6 font-medium text-sm ${
                    activeTab === 'adoption'
                      ? 'border-b-2 border-red-500 text-red-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('adoption')}
                >
                  <Heart size={18} className="inline mr-2" />
                  Solicitar Adopción
                </button>
              )}
              {pet.for_sitting && (
                <button
                  className={`py-4 px-6 font-medium text-sm ${
                    activeTab === 'sitting'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('sitting')}
                >
                  <PawPrint size={18} className="inline mr-2" />
                  Solicitar Cuidado
                </button>
              )}
            </nav>
          </div>

          {/* Contenido de los tabs */}
          <div className="p-6">
            {activeTab === 'info' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Sobre {pet.name}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Tarjeta de características */}
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Características</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Calendar size={20} className="text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Edad</p>
                          <p className="font-medium">{formatAge(pet.age)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Ruler size={20} className="text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Peso</p>
                          <p className="font-medium">{formatWeight(pet.weight)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Medal size={20} className="text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Tamaño</p>
                          <p className="font-medium">{pet.size?.name || "No disponible"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Zap size={20} className="text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Nivel de actividad</p>
                          <p className="font-medium">{pet.activity_level?.name || "No disponible"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Volume2 size={20} className="text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Nivel de ruido</p>
                          <p className="font-medium">{pet.noise_level?.name || "No disponible"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin size={20} className="text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Ubicación</p>
                          <p className="font-medium">{pet.location || "Consultar"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tarjeta de descripción */}
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Descripción</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {pet.description || "No hay descripción disponible para esta mascota. Por favor, contacta con nosotros para más información."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'adoption' && (
              <AdoptionForm 
                petName={pet.name}
                formData={formData}
                onChange={handleInputChange}
                onSubmit={() => handleSubmit('adoption')}
                isSubmitting={isSubmitting}
                success={submitSuccess}
                error={submitError}
              />
            )}

            {activeTab === 'sitting' && (
              <SittingForm 
                petName={pet.name}
                formData={formData}
                onChange={handleInputChange}
                onSubmit={() => handleSubmit('sitting')}
                isSubmitting={isSubmitting}
                success={submitSuccess}
                error={submitError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdoptionForm({ petName, formData, onChange, onSubmit, isSubmitting, success, error }) {
  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Heart size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">¡Solicitud enviada!</h3>
        <p className="text-green-700 mb-4">
          Hemos recibido tu solicitud para adoptar a {petName}. Nos pondremos en contacto contigo pronto.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Solicitar la adopción de {petName}</h2>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6 text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nombre completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">¿Por qué quieres adoptar a {petName}?</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={onChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>
        
        <div className="md:col-span-2">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Enviando..." : "Enviar solicitud de adopción"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SittingForm({ petName, formData, onChange, onSubmit, isSubmitting, success, error }) {
  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <PawPrint size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">¡Solicitud enviada!</h3>
        <p className="text-green-700 mb-4">
          Hemos recibido tu solicitud para cuidar a {petName}. Nos pondremos en contacto contigo pronto.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Solicitar el cuidado de {petName}</h2>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6 text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nombre completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Explícanos cuándo y por qué quieres cuidar a {petName}</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={onChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>
        
        <div className="md:col-span-2">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Enviando..." : "Enviar solicitud de cuidado"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4 animate-spin">
          <PawPrint className="absolute top-0 animate-bounce text-blue-900" size={20} />
          <PawPrint className="absolute top-0 right-0 animate-bounce text-red-900" size={20} />
          <PawPrint className="absolute bottom-0 animate-bounce text-yellow-900" size={20} />
          <PawPrint className="absolute bottom-0 right-0 animate-bounce text-green-900" size={20} />
        </div>
        <p className="text-lg font-medium text-blue-700">Cargando información...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Info size={32} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-red-800 mb-2">Algo salió mal</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
        >
          Volver a la página principal
        </button>
      </div>
    </div>
  );
}