import React from 'react';
import { User } from 'lucide-react';

export default function UserInfoSection({ user }) {
  return (
    <section className="mb-4">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <User className="mr-2 text-blue-600" /> Información de usuario
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role?.name}</p>
          <p><strong>Saldo:</strong> {user.wallet_balance ? `${user.wallet_balance}€` : '0.00€'}</p>
        </div>
        <div>
          {user.image && (
            <div className="flex justify-center md:justify-end">
              <img
                src={user.image}
                alt={user.name}
                className="rounded-full w-24 h-24 object-cover border-2 border-blue-500"
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center mb-2">
          <div className="flex-grow flex justify-between text-sm">
            <span>Roles disponibles:</span>
            {user.isAdmin && <span className="inline-block bg-red-500 text-white px-2 py-1 rounded-full text-xs mr-1">Admin</span>}
            {user.isCaregiver && <span className="inline-block bg-green-500 text-white px-2 py-1 rounded-full text-xs mr-1">Cuidador</span>}
            {!user.isAdmin && !user.isCaregiver && <span className="inline-block bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Usuario</span>}
          </div>
        </div>
      </div>
    </section>
);
}