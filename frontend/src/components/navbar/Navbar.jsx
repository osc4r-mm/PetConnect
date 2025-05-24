import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut } from 'lucide-react';
import NotificationsMenu from './partials/NotificationsMenu';
import { getUserImageUrl } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const isAuthenticated = !!user;
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect: Cierra menú móvil al cambiar de ruta (actualiza isOpen).
  useEffect(() => setIsOpen(false), [location.pathname]);
  
  // useEffect: Cierra el dropdown del usuario al hacer clic fuera del menú (actualiza isDropdownOpen).
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

  /**
   * handleLogout: Ejecuta el cierre de sesión, cierra el dropdown y redirige al login.
   */
  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  // Mientras carga auth
  if (loading) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="text-xl font-bold text-green-700">
            <img src="/uploads/default/logo.png" alt="" />
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow relative z-30 border-b-4 border-green-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + enlaces desktop */}
          <div className="flex">
            <Link to="/" className="self-center text-xl font-bold text-green-700">
              <img className="h-12 w-auto" src="/uploads/default/logo.png" alt="Logo PetConnect" />
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {['/', '/about', '/contact'].map((path, idx) => {
                const label = ['Inicio', 'Acerca de', 'Contacto'][idx];
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-base font-semibold transition-all ${
                      active
                        ? 'border-green-400 text-green-700'
                        : 'border-transparent text-gray-500 hover:border-green-200 hover:text-green-600'
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
                    className="flex items-center gap-x-2 text-base font-semibold text-green-700 hover:text-green-900"
                  >
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-200">
                      <img src={getUserImageUrl(user.image)} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                    <span className="truncate max-w-[120px]">{user.name}</span>
                    <ChevronDown size={16} className="text-green-400" />
                  </button>
                  {isDropdownOpen && (
                    <div 
                      id="user-dropdown"
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-1 ring-1 ring-green-200 ring-opacity-80 z-50 border border-green-100 animate-fadeIn"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-base text-green-700 font-medium hover:bg-green-50 hover:text-green-900"
                      >
                        Mi perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-base text-green-700 font-medium hover:bg-green-50 hover:text-green-900 flex items-center"
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
                <Link to="/login" className="text-green-700 font-medium hover:text-green-900 transition">
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-green-400 hover:text-green-600 hover:bg-green-100 transition"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div className="sm:hidden bg-white border-t-2 border-green-200 shadow-md animate-fadeIn">
          <div className="pt-2 pb-3 space-y-1">
            {['/','/about','/contact'].map((path, idx) => {
              const label = ['Inicio','Acerca de','Contacto'][idx];
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-semibold transition-all ${
                    active
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'border-transparent text-gray-600 hover:bg-green-100 hover:border-green-200 hover:text-green-800'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-green-100">
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-200">
                    <img src={getUserImageUrl(user.image)} alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-green-700">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-green-600 hover:bg-green-50 hover:text-green-900"
                  >
                    Mi perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-base font-medium text-green-600 hover:bg-green-50 hover:text-green-900 flex items-center"
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
                  className="block px-3 py-2 rounded-md text-base font-medium text-green-700 hover:text-green-900 hover:bg-green-50 transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-green-700 hover:to-blue-700 shadow"
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