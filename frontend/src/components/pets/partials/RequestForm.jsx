import React, { useState, useEffect } from 'react';
import { Heart, PawPrint, Check, X } from 'lucide-react';
import { request } from '../../../services/petService';
import { getAvailability, getMyAvailability } from '../../../services/availabilityService';

// Días en español y su mapping
const DAY_LABELS = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const RequestForm = ({
  pet,
  onClose,
  isOpen,
  initialType = 'adopt',
  isForAdoption,
  isForSitting,
}) => {
  const [formData, setFormData] = useState({
    type: initialType,
    message: '',
    slots: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Disponibilidad del cuidador (usuario autenticado para "care")
  const [availability, setAvailability] = useState([]);
  // Día y hora seleccionados
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedHour, setSelectedHour] = useState('');

  useEffect(() => {
    if (formData.type === 'care') {
      getMyAvailability().then(data => setAvailability(data ?? []));
    } else if (formData.type === 'adopt' && pet && pet.user_id) {
      getAvailability(pet.user_id).then(data => setAvailability(data ?? []));
    } else {
      setAvailability([]);
    }
  }, [formData.type, pet]);

  // Reiniciar el form al abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({ type: initialType, message: '', slots: [] });
      setFormErrors({});
      setSelectedDay('');
      setSelectedHour('');
    }
  }, [isOpen, initialType]);

  // Agrupa disponibilidad por día
  const slotsByDay = {};
  availability.forEach(slot => {
    if (!slotsByDay[slot.day_of_week]) slotsByDay[slot.day_of_week] = [];
    slotsByDay[slot.day_of_week].push(slot.time_slot);
  });

  // Cuando cambia el día, resetea la hora
  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
    setSelectedHour('');
  };

  // Añadir slot seleccionado
  const handleAddSlot = () => {
    if (!selectedDay || !selectedHour) return;
    // Prevenir duplicados
    if (
      formData.slots.some(
        s => s.day_of_week === selectedDay && s.time_slot === selectedHour
      )
    )
      return;

    setFormData(prev => ({
      ...prev,
      slots: [...prev.slots, { day_of_week: selectedDay, time_slot: selectedHour }],
    }));
    setSelectedDay('');
    setSelectedHour('');
  };

  // Quitar slot
  const handleRemoveSlot = idx => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== idx),
    }));
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  // Enviar
  const handleSubmit = () => {
    setFormSubmitting(true);

    // Validar que haya al menos un slot para "care"
    if (
      formData.type === 'care' &&
      (!formData.slots || formData.slots.length === 0)
    ) {
      setFormErrors({
        submit: 'Debes seleccionar al menos un día y hora para el cuidado.',
      });
      setFormSubmitting(false);
      return;
    }

    const sendData = {
      ...formData,
      agreement_data: formData.type === 'care' ? JSON.stringify(formData.slots) : null,
    };

    request(pet.id, sendData)
      .then(() => {
        setFormSuccess(true);
        setTimeout(() => {
          onClose();
          setFormSuccess(false);
          setFormData({ type: initialType, message: '', slots: [] });
        }, 2000);
      })
      .catch(error => {
        setFormErrors({
          submit: 'Ha ocurrido un error. Inténtalo de nuevo.',
        });
      })
      .finally(() => setFormSubmitting(false));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {formData.type === 'adopt' ? (
              <Heart size={24} className="text-red-500" />
            ) : (
              <PawPrint size={24} className="text-blue-500" />
            )}
            <h3 className="text-xl font-bold ml-2">Nueva solicitud</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
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
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              {process.env.NODE_ENV !== 'production' && (
  <div style={{ background: '#eee', padding: '1em', marginBottom: '1em', fontSize: '0.9em', maxHeight: 200, overflow: 'auto' }}>
    <strong>DEBUG availability:</strong>
    <pre>{JSON.stringify(availability, null, 2)}</pre>
  </div>
)}
              {/* Selector tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de solicitud
                </label>
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

              {/* Si es care, seleccionar slots */}
              {formData.type === 'care' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecciona horarios para el cuidado
                  </label>
                  <div className="flex space-x-2 mb-2">
                    {/* Día */}
                    <select
                      value={selectedDay}
                      onChange={handleDayChange}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Día</option>
                      {Object.keys(slotsByDay).map(day => (
                        <option key={day} value={day}>
                          {DAY_LABELS[day] || day}
                        </option>
                      ))}
                    </select>
                    {/* Hora */}
                    <select
                      value={selectedHour}
                      onChange={e => setSelectedHour(e.target.value)}
                      disabled={!selectedDay}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Hora</option>
                      {selectedDay &&
                        slotsByDay[selectedDay]?.map(hour => (
                          <option key={hour} value={hour}>
                            {hour.substring(0, 5)}
                          </option>
                        ))}
                    </select>
                    {/* Botón añadir */}
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-3 rounded disabled:opacity-50"
                      onClick={handleAddSlot}
                      disabled={!selectedDay || !selectedHour}
                    >
                      Añadir
                    </button>
                  </div>
                  {/* Lista de slots seleccionados */}
                  <div>
                    {formData.slots.length > 0 && (
                      <ul className="mb-2">
                        {formData.slots.map((slot, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-sm bg-blue-100 rounded px-2 py-1 mb-1"
                          >
                            <span className="flex-1">
                              {DAY_LABELS[slot.day_of_week] || slot.day_of_week}
                              {', '}
                              {slot.time_slot.substring(0, 5)}
                            </span>
                            <button
                              type="button"
                              className="ml-2 text-red-500"
                              onClick={() => handleRemoveSlot(idx)}
                            >
                              Quitar
                            </button>
                          </li>
                        ))}
                      </ul>
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
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder={`Cuéntanos por qué te gustaría ${
                    formData.type === 'adopt' ? 'adoptar' : 'cuidar'
                  } a ${pet.name}`}
                />
              </div>

              {formErrors.submit && (
                <p className="text-red-500 text-sm">{formErrors.submit}</p>
              )}

              <div className="flex justify-end pt-3 space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 border rounded-md text-gray-700 hover:bg-gray-50"
                >
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