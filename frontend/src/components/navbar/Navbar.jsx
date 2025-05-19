// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import NotificationsMenu from './partials/NotificationsMenu';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const isAuthenticated = !!user;
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Cierra menú móvil al cambiar de ruta
  useEffect(() => setIsOpen(false), [location.pathname]);
  
  // Cerrar dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownElement = document.getElementById('user-dropdown');
      const avatarButton = document.getElementById('avatar-button');
      
      if (
        dropdownElement &&
        avatarButton &&
        !dropdownElement.contains(event.target) &&
        !avatarButton.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Avatar por defecto si no hay imagen
  const renderAvatar = () => (
    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
      <User size={20} className="text-gray-600" />
    </div>
  );

  // Mientras carga auth
  if (loading) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="text-xl font-bold text-green-600">
            PetConnect
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + enlaces desktop */}
          <div className="flex">
            <Link to="/" className="self-center text-xl font-bold text-green-600">
              PetConnect
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {['/', '/about', '/contact'].map((path, idx) => {
                const label = ['Inicio', 'Acerca de', 'Contacto'][idx];
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      active
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Auth botones desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="mr-4">
                  <NotificationsMenu />
                </div>
                <div className="relative">
                  <button
                    id="avatar-button"
                    onClick={() => setIsDropdownOpen(o => !o)}
                    className="flex items-center gap-x-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                  >
                    {renderAvatar()}
                    <span>{user.name}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>
                  {isDropdownOpen && (
                    <div 
                      id="user-dropdown"
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
                      style={{ filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))' }}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mi perfil
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-gray-900">
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón menú móvil */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(o => !o)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {['/','/about','/contact'].map((path, idx) => {
              const label = ['Inicio','Acerca de','Contacto'][idx];
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    active
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-4">
                  {renderAvatar()}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Mi perfil
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1 px-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}