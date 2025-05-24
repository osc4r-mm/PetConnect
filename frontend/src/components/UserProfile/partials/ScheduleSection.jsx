import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  getAvailability,
  saveAvailability,
  deleteAvailability,
} from '../../../services/availabilityService';
import { Clock } from 'lucide-react';
import api from '../../../services/api';

const weekDayShorts = [
  { long: 'Lunes', short: 'Lns' },
  { long: 'Martes', short: 'Mrt' },
  { long: 'Miércoles', short: 'Mrc' },
  { long: 'Jueves', short: 'Jvs' },
  { long: 'Viernes', short: 'Vrn' },
  { long: 'Sábado', short: 'Sbd' },
  { long: 'Domingo', short: 'Dmg' },
];
const dayValues = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const hours = [];
for (let hour = 7; hour < 24; hour++) {
  hours.push(hour);
}

const ScheduleSection = ({ userId, isEditable = false }) => {
  const { user: currentUser } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [walks, setWalks] = useState({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('add');
  const calendarRef = useRef(null);

  // Estado para el tooltip flotante
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });

  // Responsive: muestra nombres cortos si el ancho es menor a 800px
  const [showShortDays, setShowShortDays] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setShowShortDays(window.innerWidth < 800);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar disponibilidades y paseos al montar el componente
  useEffect(() => {
    const fetchAvailabilityAndWalks = async () => {
      setLoading(true);
      try {
        const targetId = userId || currentUser?.id;
        if (!targetId) return;
        const [data, walksResp] = await Promise.all([
          getAvailability(targetId),
          api.get(`/user/${targetId}/requests?type=care`)
        ]);
        setAvailability(data);

        // Solo paseos aceptados para el USUARIO DEL PERFIL (targetId)
        const walksMap = {};
        (walksResp.data.requests || []).forEach(req => {
          if (req.sender_id !== targetId) return;
          if (req.status !== 'accepted') return;
          let agreement = {};
          try {
            agreement = typeof req.agreement_data === 'string'
              ? JSON.parse(req.agreement_data)
              : req.agreement_data || {};
          } catch (e) {}
          if (agreement && Array.isArray(agreement)) {
            agreement.forEach(slot => {
              if (!walksMap[slot.day_of_week]) walksMap[slot.day_of_week] = {};
              if (!walksMap[slot.day_of_week][slot.time_slot]) walksMap[slot.day_of_week][slot.time_slot] = [];
              walksMap[slot.day_of_week][slot.time_slot].push(req.pet?.name || req.pet_name || 'Mascota');
            });
          }
        });
        setWalks(walksMap);
      } catch (error) {
        // falla silenciosamente
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilityAndWalks();
  }, [userId, currentUser]);

  const getWalkInfo = (day, hour, quarter) => {
    const dayKey = dayValues[day];
    const timeString = `${hour.toString().padStart(2, '0')}:${(quarter * 15).toString().padStart(2, '0')}`;
    if (walks[dayKey] && walks[dayKey][timeString]) {
      return walks[dayKey][timeString]; // array de nombres de perros
    }
    return null;
  };

  const isSlotAvailable = (day, hour, quarter) => {
    const minute = quarter * 15;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return availability.some(
      (slot) => slot.day_of_week === day && slot.time_slot === timeString
    );
  };

  // Clase de cada celda según estado de paseos, disponibilidad o selección
  const getSlotClassName = (day, hour, quarter) => {
    const walkPets = getWalkInfo(day, hour, quarter);
    if (walkPets && walkPets.length > 0) return 'bg-yellow-400';

    const minute = quarter * 15;
    const slotIsAvailable = isSlotAvailable(dayValues[day], hour, quarter);

    if (isSelecting && selectedDay === day) {
      const timeValue = hour * 60 + minute;
      let startValue = -1;
      let endValue = -1;
      if (selectionStart) startValue = selectionStart.hour * 60 + selectionStart.quarter * 15;
      if (selectionEnd) endValue = selectionEnd.hour * 60 + selectionEnd.quarter * 15;
      const isInRange =
        (startValue <= timeValue && timeValue <= endValue) ||
        (endValue <= timeValue && timeValue <= startValue);
      if (mode === 'delete' && slotIsAvailable && isInRange) {
        return 'bg-red-400';
      }
      if (mode === 'add' && !slotIsAvailable && isInRange) {
        return 'bg-blue-300';
      }
    }
    if (slotIsAvailable) return 'bg-green-500';
    return 'bg-gray-100';
  };

  // Muestra el tooltip correspondiente por celda
  const handleCellMouseEnter = (e, day, hour, quarter) => {
    const walkPets = getWalkInfo(day, hour, quarter);
    let text = '';
    if (walkPets && walkPets.length > 0) {
      text = `Está paseando a: ${walkPets.join(', ')}`;
    } else {
      text = isSlotAvailable(dayValues[day], hour, quarter) ? 'Libre' : 'No disponible';
    }
    const cellRect = e.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      text,
      x: cellRect.left + cellRect.width / 2 + window.scrollX,
      y: cellRect.top - 8 + window.scrollY,
    });
  };
  const handleCellMouseLeave = () => {
    setTooltip(tooltip => ({ ...tooltip, visible: false }));
  };

  // --- Selección de slots de disponibilidad con mouse
  const handleMouseDown = (day, hour, quarter) => {
    if (!isEditable) return;
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    setIsSelecting(true);
    setSelectedDay(day);
    setSelectionStart({ hour, quarter });
    setSelectionEnd({ hour, quarter });
  };

  const handleMouseOver = (day, hour, quarter) => {
    if (!isSelecting || day !== selectedDay) return;
    setSelectionEnd({ hour, quarter });
  };

  const handleMouseUp = async () => {
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    if (!isSelecting || !selectionStart || !selectionEnd) {
      setIsSelecting(false);
      return;
    }
    const dayName = dayValues[selectedDay];
    const startMinutes = selectionStart.hour * 60 + selectionStart.quarter * 15;
    const endMinutes = selectionEnd.hour * 60 + selectionEnd.quarter * 15;
    const [minMinutes, maxMinutes] =
      startMinutes <= endMinutes
        ? [startMinutes, endMinutes]
        : [endMinutes, startMinutes];
    const slots = [];
    for (let time = minMinutes; time <= maxMinutes; time += 15) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      slots.push({
        day_of_week: dayName,
        time_slot: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      });
    }
    try {
      if (mode === 'delete') {
        await deleteAvailability(userId, slots);
        setAvailability((prev) =>
          prev.filter(
            (slot) =>
              !slots.some(
                (s) =>
                  s.day_of_week === slot.day_of_week && s.time_slot === slot.time_slot
              )
          )
        );
      } else {
        await saveAvailability(userId, slots);
        setAvailability((prev) => [...prev, ...slots]);
      }
    } catch (error) {
      alert(`No se pudo ${mode === 'add' ? 'añadir' : 'eliminar'} la disponibilidad.`);
    }
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    setSelectedDay(null);
  };

  // Limpia la selección y el tooltip si el mouse sale del calendario
  const handleMouseLeave = () => {
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      setSelectedDay(null);
    }
    setTooltip(tooltip => ({ ...tooltip, visible: false }));
  };

  return (
    <div className="mt-8 w-full bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-100 shadow">
      <h3 className="text-xl font-bold mb-4 flex items-center text-green-700">
        <Clock className="mr-2" size={20} />
        Disponibilidad semanal
      </h3>
      {isEditable && (
        <div className="mb-4 flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Haz clic y arrastra para seleccionar y configurar tu disponibilidad.
            <br />
            Verde = libre. Amarillo = paseando. Azul: vas a añadir. Rojo: vas a eliminar.
          </span>
          <button
            className={`px-4 py-1 rounded text-white font-semibold transition ${
              mode === 'add'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            onClick={() => setMode((m) => (m === 'add' ? 'delete' : 'add'))}
          >
            {mode === 'add' ? 'Modo: Añadir horas' : 'Modo: Eliminar horas'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">Cargando disponibilidad...</div>
      ) : (
        <div
          className="overflow-x-auto"
          ref={calendarRef}
          onMouseLeave={handleMouseLeave}
          style={{
            userSelect: isSelecting ? 'none' : '',
            WebkitUserSelect: isSelecting ? 'none' : '',
          }}
        >
          <div className="min-w-max">
            {/* Encabezado de días */}
            <div className="flex">
              <div className="w-14 min-w-[3rem]" />
              {weekDayShorts.map((day, idx) => (
                <div
                  key={day.long}
                  className="flex-1 min-w-[2.5rem] px-1 py-1 font-bold text-xs text-center bg-gray-100 border-b border-gray-300 border-r last:border-r-0 select-none"
                  style={{ width: 40, maxWidth: 1000 }}
                >
                  <span className="hidden sm:block">{showShortDays ? day.short : day.long}</span>
                  <span className="block sm:hidden">{day.short}</span>
                </div>
              ))}
            </div>
            {/* Horario */}
            <div className="flex">
              {/* Columna de horas */}
              <div className="flex flex-col">
                {hours.map((hour, hidx) => (
                  <div
                    key={hour}
                    className="w-14 min-w-[3rem] h-16 flex items-center justify-center text-xs font-mono font-bold border-b-4 border-gray-400 bg-gray-50 z-10"
                    style={{ gridRow: `span 4 / span 4` }}
                  >
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </div>
                ))}
              </div>
              {/* Celdas de disponibilidad */}
              {weekDayShorts.map((_, dayIndex) => (
                <div key={dayIndex} className="flex flex-col flex-1 min-w-[2.5rem]">
                  {hours.map((hour, hidx) =>
                    [0, 1, 2, 3].map((quarter, qidx) => (
                      <div
                        key={`${dayIndex}-${hour}-${quarter}`}
                        className={`
                          h-4
                          ${getSlotClassName(dayIndex, hour, quarter)}
                          ${isEditable ? 'cursor-pointer hover:opacity-80' : ''}
                          border-b border-gray-200 transition-all
                          ${qidx === 3 ? 'border-b-4 border-gray-400' : ''}
                        `}
                        onMouseDown={
                          isEditable
                            ? () => handleMouseDown(dayIndex, hour, quarter)
                            : undefined
                        }
                        onMouseOver={
                          isEditable
                            ? () => handleMouseOver(dayIndex, hour, quarter)
                            : undefined
                        }
                        onMouseUp={isEditable ? handleMouseUp : undefined}
                        style={{ minHeight: '1rem', maxHeight: '1.2rem', position: 'relative' }}
                        onMouseEnter={e => handleCellMouseEnter(e, dayIndex, hour, quarter)}
                        onMouseLeave={handleCellMouseLeave}
                      ></div>
                    ))
                  )}
                </div>
              ))}
            </div>
            {/* Tooltip flotante */}
            {tooltip.visible && (
              <div
                style={{
                  position: 'absolute',
                  top: tooltip.y,
                  left: tooltip.x,
                  transform: 'translate(-50%, -100%)',
                  background: '#222',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  pointerEvents: 'none',
                  zIndex: 50,
                  whiteSpace: 'nowrap',
                }}
              >
                {tooltip.text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSection;