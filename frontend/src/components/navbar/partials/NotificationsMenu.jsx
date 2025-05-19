import React, { useState, useEffect, useRef } from 'react';
import { getNotifications } from '../../../services/notificationService';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsMenu = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const menuRef = useRef();

  useEffect(() => {
    if (open) {
      getNotifications().then(({ received, sent }) => {
        setReceived(received);
        setSent(sent);
      });
    }
  }, [open]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handle = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

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
                  <button className="bg-green-500 text-white rounded px-2 py-1 text-xs">Aceptar</button>
                  <button className="bg-red-500 text-white rounded px-2 py-1 text-xs">Rechazar</button>
                </div>
                <div className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleString()}</div>
              </div>
            ))}
            {tab === 'sent' && sent.map(req => (
              <div key={req.id} className="p-4 border-b text-sm">
                Has enviado una solicitud para {req.type === 'adopt' ? 'adoptar' : 'cuidar'} a {req.receiver.name} por {req.pet.name}
                {req.message && <div className="text-gray-600 mt-1">"{req.message}"</div>}
                <div className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t text-center">
            <Link to="/requests" className="text-green-700 hover:underline text-xs">Ver todas las solicitudes</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;