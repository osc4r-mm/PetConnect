import React, { useState, useEffect } from 'react';
import { Heart, PawPrint, Check, X } from 'lucide-react';
import { request } from '../../../services/petService';

const RequestForm = ({ pet, onClose, isOpen, initialType, isForAdoption, isForSitting }) => {
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
          setFormData({ message: '', type: initialType });
        }, 2000);
      })
      .catch(error => {
        console.error('Error al enviar solicitud:', error);
        setFormErrors({ submit: 'Ha ocurrido un error. Inténtalo de nuevo.' });
      })
      .finally(() => setFormSubmitting(false));
  };

  // Resetear el formulario cuando se abre
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
              {/* Selector de tipo - Solo se muestra si ambos tipos están disponibles */}
              {isForAdoption && isForSitting ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de solicitud</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {isForAdoption && <option value="adopt">Adoptar</option>}
                    {isForSitting && <option value="care">Cuidar</option>}
                  </select>
                </div>
              ) : (
                // Si solo hay un tipo disponible, mostrar como información en vez de selector
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-1">Tipo de solicitud</p>
                  <div className="p-2 bg-gray-100 rounded-md text-gray-800 flex items-center">
                    {isForAdoption ? (
                      <>
                        <Heart size={16} className="text-red-500 mr-2" /> 
                        Adopción
                        <input type="hidden" name="type" value="adopt" />
                      </>
                    ) : (
                      <>
                        <PawPrint size={16} className="text-blue-500 mr-2" /> 
                        Cuidado
                        <input type="hidden" name="type" value="care" />
                      </>
                    )}
                  </div>
                </div>
              )}
              
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
                <button 
                  type="submit" 
                  disabled={formSubmitting}
                  className={`py-2 px-4 text-white rounded-md ${
                    formData.type === 'adopt' 
                      ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' 
                      : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
                  }`}
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

export default RequestForm;