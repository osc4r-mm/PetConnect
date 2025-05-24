import React, { useState, useEffect } from 'react';
import { Heart, PawPrint, Check, X } from 'lucide-react';
import { request } from '../../../services/petService';
import { getAvailability, getMyAvailability } from '../../../services/availabilityService';
import { useAuth } from '../../../context/AuthContext';

const DAY_LABELS = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};
const WEEK_DAYS_ORDER = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

function sortSlots(a, b) {
  const dayA = WEEK_DAYS_ORDER.indexOf(a.day_of_week);
  const dayB = WEEK_DAYS_ORDER.indexOf(b.day_of_week);
  if (dayA !== dayB) return dayA - dayB;
  return a.time_slot.localeCompare(b.time_slot, 'en', { numeric: true });
}

const RequestForm = ({
  pet,
  onClose,
  isOpen,
  initialType = 'adopt',
  isForAdoption,
  isForSitting,
  isCaregiverUser
}) => {
  const [formData, setFormData] = useState({
    type: initialType,
    message: '',
    slots: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const { user: currentUser } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedHour, setSelectedHour] = useState('');

  useEffect(() => {
    if (formData.type === 'care') {
      if (currentUser) {
        getMyAvailability()
          .then(data => setAvailability(data ?? []))
          .catch(() => setAvailability([]));
      } else {
        setAvailability([]);
      }
    } else if (formData.type === 'adopt' && pet && pet.user_id) {
      getAvailability(pet.user_id)
        .then(data => setAvailability(data ?? []))
        .catch(() => setAvailability([]));
    } else {
      setAvailability([]);
    }
  }, [formData.type, pet, currentUser]);

  useEffect(() => {
    if (isOpen) {
      setFormData({ type: initialType, message: '', slots: [] });
      setFormErrors({});
      setSelectedDay('');
      setSelectedHour('');
    }
  }, [isOpen, initialType]);

  const slotsByDay = {};
  availability.forEach(slot => {
    if (!slotsByDay[slot.day_of_week]) slotsByDay[slot.day_of_week] = [];
    slotsByDay[slot.day_of_week].push(slot.time_slot);
  });

  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
    setSelectedHour('');
  };

  const handleAddSlot = () => {
    if (!selectedDay || !selectedHour) return;
    if (
      formData.slots.some(
        s => s.day_of_week === selectedDay && s.time_slot === selectedHour
      )
    )
      return;

    const newSlots = [...formData.slots, { day_of_week: selectedDay, time_slot: selectedHour }];
    newSlots.sort(sortSlots);

    setFormData(prev => ({
      ...prev,
      slots: newSlots,
    }));
    setSelectedDay('');
    setSelectedHour('');
  };

  const handleRemoveSlot = idx => {
    const newSlots = formData.slots.slice();
    newSlots.splice(idx, 1);
    setFormData(prev => ({
      ...prev,
      slots: newSlots,
    }));
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = () => {
    setFormSubmitting(true);
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
      .catch(() => {
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2 border-green-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {formData.type === 'adopt' ? (
              <Heart size={24} className="text-red-500" />
            ) : (
              <PawPrint size={24} className="text-blue-500" />
            )}
            <h3 className="text-xl font-bold ml-2 text-green-700">Nueva solicitud</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-green-500"
          >
            <X size={20} />
          </button>
        </div>
        {formSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-green-700">¡Solicitud enviada!</h3>
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
              {/* Selector tipo */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Tipo de solicitud
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-green-200 rounded-md bg-white"
                >
                  {isForAdoption && <option value="adopt">Adoptar</option>}
                  {isForSitting && isCaregiverUser && <option value="care">Cuidar</option>}
                </select>
              </div>
              {/* Si es care, seleccionar slots */}
              {formData.type === 'care' && (
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Selecciona horarios para el cuidado
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <select
                      value={selectedDay}
                      onChange={handleDayChange}
                      className="p-2 border border-green-200 rounded-md bg-white"
                    >
                      <option value="">Día</option>
                      {Object.keys(slotsByDay).map(day => (
                        <option key={day} value={day}>
                          {DAY_LABELS[day] || day}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedHour}
                      onChange={e => setSelectedHour(e.target.value)}
                      disabled={!selectedDay}
                      className="p-2 border border-green-200 rounded-md bg-white"
                    >
                      <option value="">Hora</option>
                      {selectedDay &&
                        slotsByDay[selectedDay]
                          .filter(hour =>
                            !formData.slots.some(
                              s => s.day_of_week === selectedDay && s.time_slot === hour
                            )
                          )
                          .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
                          .map(hour => (
                            <option key={hour} value={hour}>
                              {hour.substring(0, 5)}
                            </option>
                          ))}
                    </select>
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-3 rounded disabled:opacity-50"
                      onClick={handleAddSlot}
                      disabled={!selectedDay || !selectedHour}
                    >
                      Añadir
                    </button>
                  </div>
                  <div>
                    {formData.slots.length > 0 && (
                      <ul className="mb-2">
                        {formData.slots
                          .slice()
                          .sort(sortSlots)
                          .map((slot, idx) => (
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
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Mensaje (opcional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-green-200 rounded-md bg-white"
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
                  className="py-2 px-4 border rounded-md text-green-700 border-green-200 hover:bg-green-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className={`py-2 px-4 text-white rounded-md shadow ${
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