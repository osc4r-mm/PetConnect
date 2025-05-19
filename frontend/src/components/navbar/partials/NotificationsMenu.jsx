import React, { useState, useEffect, useRef } from 'react';
import { getRequests } from '../../../services/requestService';
import { acceptRequest, rejectRequest, cancelRequest } from '../../../services/requestService';
import { Bell, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsMenu = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [feedback, setFeedback] = useState({});
  const menuRef = useRef();

  // Recarga notificaciones si se ha actuado sobre alguna
  const fetchNotifications = () => {
    getRequests().then(({ received, sent }) => {
      setReceived(received);
      setSent(sent);
    });
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handle = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const handleAccept = async (id) => {
    await acceptRequest(id);
    setFeedback(f => ({ ...f, [id]: 'accepted' }));
    setTimeout(fetchNotifications, 500);
  };

  const handleReject = async (id) => {
    await rejectRequest(id);
    setFeedback(f => ({ ...f, [id]: 'rejected' }));
    setTimeout(fetchNotifications, 500);
  };

  const handleCancel = async (id) => {
    if (window.confirm('¿Seguro que quieres anular el contrato? Esta acción es irreversible.')) {
      await cancelRequest(id);
      setFeedback(f => ({ ...f, [id]: 'cancelled' }));
      setTimeout(fetchNotifications, 500);
    }
  };

  const unreadCount = received.length;

  return (
    <div className="relative" ref={menuRef}>
      <button className="relative" onClick={() => setOpen(!open)}>
        <Bell size={22} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-md z-50">
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 text-sm font-bold ${tab === 'received' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500'}`}
              onClick={() => setTab('received')}
            >
              Recibidas
            </button>
            <button
              className={`flex-1 py-2 text-sm font-bold ${tab === 'sent' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500'}`}
              onClick={() => setTab('sent')}
            >
              Enviadas
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {tab === 'received' && received.length === 0 && (
              <div className="p-4 text-gray-500">No tienes solicitudes recibidas pendientes.</div>
            )}
            {tab === 'sent' && sent.length === 0 && (
              <div className="p-4 text-gray-500">No has enviado solicitudes pendientes.</div>
            )}
            {tab === 'received' && received.map(req => (
              <div key={req.id} className="p-4 border-b text-sm">
                <div className="font-semibold">{req.sender.name} te ha enviado una solicitud para {req.type === 'adopt' ? 'adoptar' : 'cuidar'} a {req.pet.name}</div>
                {req.message && <div className="text-gray-600 mt-1">"{req.message}"</div>}
                <div className="flex gap-2 mt-2">
                  {req.status === 'accepted' ? (
                    <>
                      <span className="flex items-center text-green-700 font-bold"><Check size={16} className="mr-1" />Aceptada</span>
                      <button
                        className="bg-yellow-500 text-white rounded px-2 py-1 text-xs"
                        onClick={() => handleCancel(req.id)}
                      >Anular contrato</button>
                    </>
                  ) : req.status === 'rejected' ? (
                    <span className="flex items-center text-red-700 font-bold"><X size={16} className="mr-1" />Rechazada</span>
                  ) : (
                    <>
                      <button
                        className="bg-green-500 text-white rounded px-2 py-1 text-xs"
                        onClick={() => handleAccept(req.id)}
                      >Aceptar</button>
                      <button
                        className="bg-red-500 text-white rounded px-2 py-1 text-xs"
                        onClick={() => handleReject(req.id)}
                      >Rechazar</button>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleString()}</div>
              </div>
            ))}
            {tab === 'sent' && sent.map(req => (
              <div key={req.id} className="p-4 border-b text-sm">
                Has enviado una solicitud para {req.type === 'adopt' ? 'adoptar' : 'cuidar'} a {req.pet.name} de {req.receiver.name}
                {feedback[req.id] === 'accepted' ? (
                  <span className="ml-2 flex items-center text-green-700 font-bold"><Check size={16} className="mr-1" />Aceptada</span>
                ) : feedback[req.id] === 'rejected' ? (
                  <span className="ml-2 flex items-center text-red-700 font-bold"><X size={16} className="mr-1" />Rechazada</span>
                ) : null}
                {req.message && <div className="text-gray-600 mt-1">"{req.message}"</div>}
                <div className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;