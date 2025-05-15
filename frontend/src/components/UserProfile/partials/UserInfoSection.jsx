import React from 'react';
import { User } from 'lucide-react';

export default function UserInfoSection({ user }) {
  return (
    <section className="flex-1 mb-4">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <User className="mr-2 text-blue-600" /> Información de usuario
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role?.name}</p>
          <p><strong>Saldo:</strong> {user.wallet_balance?.toFixed(2)}€</p>
        </div>
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

      <div className="mt-4 flex space-x-2 text-sm">
        {user.isAdmin && <Badge text="Admin" color="red" />}
        {user.isCaregiver && <Badge text="Cuidador" color="green" />}
        {!user.isAdmin && !user.isCaregiver && <Badge text="Usuario" color="blue" />}
      </div>
    </section>
    );
}