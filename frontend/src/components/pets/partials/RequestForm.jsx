import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { request } from '../../../services/petService';

const RequestForm = ({ pet, onClose, isOpen, initialType }) => {
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

export default RequestForm;