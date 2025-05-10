import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="p-4 bg-gray-100 flex justify-between">
      <div>
        <Link to="/" className="mr-4">Home</Link>
        {!user && <>
          <Link to="/login" className="mr-4">Login</Link>
          <Link to="/register">Register</Link>
        </>}
      </div>
      {user && (
        <div className="flex items-center">
          <span className="mr-4">Hola, {user?.name || 'Usuario'}</span>
          <button onClick={logout} className="px-2 py-1 border rounded">Logout</button>
        </div>
      )}
    </nav>
  );
}
