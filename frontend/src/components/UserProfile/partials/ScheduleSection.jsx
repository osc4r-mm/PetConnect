import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  getAvailability, 
  saveAvailability, 
  deleteAvailability 
} from '../../../services/availabilityService';
import { Clock } from 'lucide-react';

const ScheduleSection = ({ userId, isEditable = false }) => {
  const { user: currentUser } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  // Preparar datos para el calendario
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dayValues = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Generar horas desde 7:00 hasta 23:00
  const hours = [];
  for (let hour = 7; hour < 24; hour++) {
    hours.push(hour);
  }

  // Cargar disponibilidades al montar el componente
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const targetId = userId || currentUser?.id;
        if (!targetId) return;

        const data = await getAvailability(targetId);
        setAvailability(data);
      } catch (error) {
        console.error('Error al cargar disponibilidad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [userId, currentUser]);

  // Verificar si un slot está marcado como disponible
  const isSlotAvailable = (day, hour, quarter) => {
    const minute = quarter * 15;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return availability.some(slot => 
      slot.day_of_week === day && 
      slot.time_slot === timeString
    );
  };

  // Obtener clase CSS basada en disponibilidad y selección
  const getSlotClassName = (day, hour, quarter) => {
    const minute = quarter * 15;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Si el slot está en la base de datos, está disponible (verde)
    if (isSlotAvailable(dayValues[day], timeString)) {
      return 'bg-green-500';
    }
    
    // Si estamos seleccionando y es el mismo día
    if (isSelecting && selectedDay === day) {
      // Verificar si está dentro del rango de selección
      const timeValue = hour * 60 + minute;
      let startValue = -1;
      let endValue = -1;
      
      if (selectionStart) {
        startValue = selectionStart.hour * 60 + selectionStart.quarter * 15;
      }
      
      if (selectionEnd) {
        endValue = selectionEnd.hour * 60 + selectionEnd.quarter * 15;
      }
      
      const isInRange = (startValue <= timeValue && timeValue <= endValue) || 
                        (endValue <= timeValue && timeValue <= startValue);
      
      if (isInRange) {
        return 'bg-blue-300';
      }
    }
    
    // Por defecto - no disponible
    return 'bg-gray-100';
  };

  // Iniciar selección
  const handleMouseDown = (day, hour, quarter) => {
    if (!isEditable) return;
    
    // Desactivar selección de texto durante el arrastre
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    setIsSelecting(true);
    setSelectedDay(day);
    setSelectionStart({ hour, quarter });
    setSelectionEnd({ hour, quarter });
  };

  // Actualizar selección mientras arrastramos
  const handleMouseOver = (day, hour, quarter) => {
    if (!isSelecting || day !== selectedDay) return;
    setSelectionEnd({ hour, quarter });
  };

  // Finalizar selección
  const handleMouseUp = async () => {
    // Re-habilitar selección de texto
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    if (!isSelecting || !selectionStart || !selectionEnd) {
      setIsSelecting(false);
      return;
    }

    const dayName = dayValues[selectedDay];
    
    // Convertir a minutos totales
    const startMinutes = selectionStart.hour * 60 + selectionStart.quarter * 15;
    const endMinutes = selectionEnd.hour * 60 + selectionEnd.quarter * 15;
    
    // Ordenar inicio y fin
    const [minMinutes, maxMinutes] = startMinutes <= endMinutes 
      ? [startMinutes, endMinutes] 
      : [endMinutes, startMinutes];

    // Formatear para la confirmación
    const formatTimeString = (minutes) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    const startFormatted = formatTimeString(minMinutes);
    const endFormatted = formatTimeString(maxMinutes);
    
    // Comprobar si estamos eliminando o agregando
    const isRemoving = isSlotAvailable(
      dayName, 
      selectionStart.hour, 
      selectionStart.quarter
    );
    
    const action = isRemoving ? 'eliminar' : 'agregar';
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres ${action} disponibilidad para el ${days[selectedDay]} de ${startFormatted} a ${endFormatted}?`
    );

    if (confirmed) {
      // Generar todos los slots de 15 minutos en el rango
      const slots = [];
      for (let time = minMinutes; time <= maxMinutes; time += 15) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        slots.push({
          day_of_week: dayName,
          time_slot: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        });
      }

      try {
        if (isRemoving) {
          // Eliminar disponibilidad
          await deleteAvailability(slots);
          // Actualizar estado local removiendo los slots
          setAvailability(prev => prev.filter(slot => 
            !slots.some(s => s.day_of_week === slot.day_of_week && s.time_slot === slot.time_slot)
          ));
        } else {
          // Guardar disponibilidad
          const result = await saveAvailability(slots);
          // Actualizar estado local agregando los nuevos slots
          setAvailability(prev => [...prev, ...result]);
        }
      } catch (error) {
        console.error(`Error al ${action} disponibilidad:`, error);
        alert(`No se pudo ${action} la disponibilidad.`);
      }
    }

    // Reiniciar selección
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    setSelectedDay(null);
  };

  // Cancelar selección si el mouse sale del calendario
  const handleMouseLeave = () => {
    // Re-habilitar selección de texto
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      setSelectedDay(null);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <Clock className="mr-2" size={20} />
        Disponibilidad semanal
      </h3>
      
      {isEditable && (
        <p className="mb-4 text-sm text-gray-600">
          Haz clic y arrastra para seleccionar y configurar tu disponibilidad. 
          Las áreas en verde indican horas en las que estás disponible.
        </p>
      )}

      {loading ? (
        <div className="text-center py-4">Cargando disponibilidad...</div>
      ) : (
        <div 
          className="overflow-x-auto"
          ref={calendarRef}
          onMouseLeave={handleMouseLeave}
          // Aplicar la desactivación de selección al contenedor también
          style={{ userSelect: isSelecting ? 'none' : '', WebkitUserSelect: isSelecting ? 'none' : '' }}
        >
          <div className="min-w-max">
            {/* Encabezados de días */}
            <div className="grid grid-cols-8 border-b border-gray-300">
              <div className="p-2 font-bold bg-gray-100 border-r border-gray-300">Hora</div>
              {days.map((day) => (
                <div key={day} className="p-2 font-bold text-center bg-gray-100 border-r border-gray-300">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendario con celdas más compactas */}
            <div className="border-l border-gray-300">
              {hours.map(hour => (
                <div key={hour} className="flex">
                  {/* Columna de hora */}
                  <div className="w-1/8 px-2 py-1 border-r border-b border-gray-300 bg-gray-50 flex items-center justify-center min-w-[60px]">
                    {hour}:00
                  </div>
                  
                  {/* Columnas para cada día de la semana */}
                  {days.map((_, dayIndex) => (
                    <div key={`day-${dayIndex}`} className="w-1/8 flex-1 border-r border-b border-gray-300">
                      {/* 4 cuartos de hora por cada celda de hora */}
                      <div className="grid grid-rows-4 h-full">
                        {[0, 1, 2, 3].map(quarter => (
                          <div
                            key={`${dayIndex}-${hour}-${quarter}`}
                            className={`h-6 ${getSlotClassName(dayIndex, hour, quarter)} ${isEditable ? 'cursor-pointer hover:opacity-80' : ''} border-b border-gray-200 last:border-b-0`}
                            onMouseDown={isEditable ? () => handleMouseDown(dayIndex, hour, quarter) : undefined}
                            onMouseOver={isEditable ? () => handleMouseOver(dayIndex, hour, quarter) : undefined}
                            onMouseUp={isEditable ? handleMouseUp : undefined}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSection;