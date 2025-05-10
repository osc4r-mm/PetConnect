import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="p-6">
      <h1 className="text-2xl">Hola, {user?.name || 'Usuario'}!</h1>
      <p>Bienvenido a tu panel.</p>
    </div>
  );
}
