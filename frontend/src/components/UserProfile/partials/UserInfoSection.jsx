// src/components/UserProfile/partials/UserInfoSection.jsx
import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const roleColors = {
  admin: 'bg-red-500',
  caregiver: 'bg-green-500',
  user: 'bg-blue-500',
};

export default function UserInfoSection({ user }) {
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === user.id;

  const roleName = user.role?.name || 'user';
  const badgeColor = roleColors[roleName] || roleColors.user;

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold flex items-center">
          <UserIcon className="mr-2 text-blue-600" /> Mi Perfil
        </h2>
        <span className={`${badgeColor} text-white px-3 py-1 rounded-full text-sm uppercase`}>{roleName}</span>
      </div>
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {user.image && (
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <img
              src={user.image}
              alt={user.name}
              className="rounded-full w-24 h-24 object-cover border-2 border-gray-300"
            />
          </div>
        )}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Nombre" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          {isOwnProfile && <InfoRow label="Saldo" value={`${Number(user.wallet_balance) || 0}€`} />}
          {user.gender && <InfoRow label="Género" value={user.gender} />}
          {user.age && <InfoRow label="Edad" value={`${user.age} años`} />}
          {user.description && <InfoRow label="Descripción" value={user.description} />}
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 uppercase">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}
