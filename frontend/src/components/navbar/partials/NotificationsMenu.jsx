import React, { useState, useEffect, useRef } from 'react';
import { getRequests, acceptRequest, rejectRequest, cancelRequest } from '../../../services/requestService';
import { Bell, PawPrint, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const requestTypeIcon = (type) =>
  type === 'care'
    ? <PawPrint size={16} className="inline-block text-blue-600 align-middle ml-2" />
    : <Heart size={15} className="inline-block text-pink-500 align-middle ml-2" />;

const weekDays = {
  0: "Lunes",
  1: "Martes",
  2: "Miércoles",
  3: "Jueves",
  4: "Viernes",
  5: "Sábado",
  6: "Domingo"
};

function formatSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return null;
  const entries = Object.entries(schedule).filter(([_, times]) => Array.isArray(times) && times.length > 0);

  if (entries.length === 0) {
    return <div className="mt-1 text-xs text-gray-500">Sin horarios seleccionados</div>;
  }

  return (
    <div className="mt-1 text-xs text-gray-700">
      {entries.map(([day, times]) => (
        <div key={day}>
          <span className="font-semibold">{weekDays[day] || day}:</span>{" "}
          {times.join(', ')}
        </div>
      ))}
    </div>
  );
}

const NotificationsMenu = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const menuRef = useRef();
  const { user } = useAuth();

  // Cargar todas las notificaciones (no solo pending)
  const fetchNotifications = () => {
    getRequests().then(({ received, sent }) => {
      setReceived(received);
      setSent(sent);
    });
  };

  // 1. Cargar notificaciones al abrir el menú (ya lo tienes)
  useEffect(() => {
    if (open && user) fetchNotifications();
  }, [open, user]);

  // 2. Cargar notificaciones al montar el componente SI hay usuario autenticado
  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handle = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Cambia el status localmente en el array correspondiente
  const handleAccept = async (id) => {
    await acceptRequest(id);
    setReceived(prev =>
      prev.map(req => req.id === id ? { ...req, status: 'accepted' } : req)
    );
  };

  const handleReject = async (id) => {
    await rejectRequest(id);
    setReceived(prev =>
      prev.map(req => req.id === id ? { ...req, status: 'rejected' } : req)
    );
  };

  const handleCancel = async (id) => {
    if (window.confirm('¿Seguro que quieres anular el contrato? Esta acción es irreversible.')) {
      await cancelRequest(id);
      setReceived(prev =>
        prev.map(req => req.id === id ? { ...req, status: 'cancelled' } : req)
      );
      setSent(prev =>
        prev.map(req => req.id === id ? { ...req, status: 'cancelled' } : req)
      );
    }
  };

  // Ahora cuenta solo las pendientes
  const unreadCount = received.filter(r => r.status === 'pending').length;

  const statusBadge = (status) => {
    if (status === 'pending')
      return <span className="ml-2 inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold align-middle">Pendiente</span>;
    if (status === 'accepted')
      return <span className="ml-2 inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold align-middle">Aceptada</span>;
    if (status === 'rejected')
      return <span className="ml-2 inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold align-middle">Rechazada</span>;
    if (status === 'cancelled')
      return <span className="ml-2 inline-block bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold align-middle">Anulada</span>;
    return null;
  };

  // Si no hay usuario, no mostrar el icono
  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button className="relative" onClick={() => setOpen(!open)}>
        <Bell size={22} className="text-purple-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-2xl z-50 border-2 border-purple-100 animate-fadeIn">
          <div className="flex border-b border-purple-100">
            <button
              className={`flex-1 py-2 text-base font-bold rounded-tl-2xl transition-colors ${
                tab === 'received'
                  ? 'border-b-2 border-purple-400 text-purple-700 bg-purple-50'
                  : 'text-gray-500 hover:bg-purple-50'
              }`}
              onClick={() => setTab('received')}
            >
              Recibidas
            </button>
            <button
              className={`flex-1 py-2 text-base font-bold rounded-tr-2xl transition-colors ${
                tab === 'sent'
                  ? 'border-b-2 border-purple-400 text-purple-700 bg-purple-50'
                  : 'text-gray-500 hover:bg-purple-50'
              }`}
              onClick={() => setTab('sent')}
            >
              Enviadas
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {tab === 'received' && received.length === 0 && (
              <div className="p-6 text-purple-400 text-center">No tienes solicitudes recibidas.</div>
            )}
            {tab === 'sent' && sent.length === 0 && (
              <div className="p-6 text-purple-400 text-center">No has enviado solicitudes.</div>
            )}
            {/* Recibidas */}
            {tab === 'received' && received.map(req => (
              <div key={req.id} className="p-4 border-b border-purple-50 text-sm bg-purple-50/40">
                <div className="font-semibold text-purple-700">
                  {req.sender && req.sender.name
                    ? (
                      <span>
                        <Link
                          to={`/user/${req.sender.id}`}
                          className="text-blue-700 hover:underline font-bold"
                          onClick={() => setOpen(false)}
                        >
                          {req.sender.name}
                        </Link>
                        {' '}te ha enviado una solicitud para {req.type === 'adopt' ? 'adoptar' : 'cuidar'} a {req.pet.name}
                      </span>
                    ) : <span>Solicitud para {req.type === 'adopt' ? 'adoptar' : 'cuidar'} a {req.pet.name}</span>
                  }
                </div>
                {req.message && <div className="text-gray-600 mt-1">"{req.message}"</div>}

                {/* MOSTRAR HORARIOS SI ES DE CUIDADO Y TIENE SCHEDULE */}
                {req.type === 'care' && req.schedule && formatSchedule(req.schedule)}

                <div className="flex gap-2 mt-2 flex-wrap">
                  {/* SOLO mostrar los botones si está pending */}
                  {req.status === 'pending' && (
                    <>
                      <button
                        className="bg-green-500 text-white rounded px-2 py-1 text-xs shadow hover:bg-green-600"
                        onClick={() => handleAccept(req.id)}
                      >Aceptar</button>
                      <button
                        className="bg-red-500 text-white rounded px-2 py-1 text-xs shadow hover:bg-red-600"
                        onClick={() => handleReject(req.id)}
                      >Rechazar</button>
                    </>
                  )}
                  {/* Mostrar botón de anular solo si es aceptada y NO es adopt */}
                  {req.status === 'accepted' && req.type !== 'adopt' && (
                    <button
                      className="bg-yellow-500 text-white rounded px-2 py-1 text-xs shadow hover:bg-yellow-600"
                      onClick={() => handleCancel(req.id)}
                    >Anular contrato</button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleString()}</span>
                  <span className="flex items-center">
                    {requestTypeIcon(req.type)}
                    {statusBadge(req.status)}
                  </span>
                </div>
              </div>
            ))}

            {tab === 'sent' && sent.map(req => (
              <div key={req.id} className="p-4 border-b border-purple-50 text-sm bg-purple-50/40">
                Has enviado una solicitud para {req.type === 'adopt' ? 'adoptar' : 'cuidar'} a {req.pet.name} de {
                  req.receiver?.name ? (
                    <Link
                      to={`/user/${req.receiver.id}`}
                      className="text-blue-700 hover:underline font-bold"
                      onClick={() => setOpen(false)}
                    >
                      {req.receiver.name}
                    </Link>
                  ) : "el dueño"
                }
                {req.message && <div className="text-gray-600 mt-1">"{req.message}"</div>}
                {/* MOSTRAR HORARIOS SI ES DE CUIDADO Y TIENE SCHEDULE */}
                {req.type === 'care' && req.schedule && formatSchedule(req.schedule)}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleString()}</span>
                  <span className="flex items-center">
                    {requestTypeIcon(req.type)}
                    {statusBadge(req.status)}
                  </span>
                </div>
                {/* Botón de anular solo si aceptada y NO es adopt */}
                {req.status === 'accepted' && req.type !== 'adopt' && (
                  <button
                    className="mt-2 bg-yellow-500 text-white rounded px-2 py-1 text-xs shadow hover:bg-yellow-600"
                    onClick={() => handleCancel(req.id)}
                  >
                    Anular contrato
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;