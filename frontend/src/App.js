// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import CookiesModal, { isCookiesAccepted } from './components/cookies/CookiesModal';
import { LoadingScreen } from './components/Util';
import Login     from './components/auth/Login';
import Register  from './components/auth/Register';
import Navbar    from './components/navbar/Navbar';
import Home      from './components/home/Home';
import Caregivers from './components/caregivers/Caregivers';
import PetDetail from './components/pets/PetDetail';
import Profile   from './components/UserProfile/Profile';
import Contact from './components/contact/contact';
import About from './components/about/about';

// Guard de rutas privadas
function PrivateRoute() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingScreen message="Verificando sesión…" />;
  }
  
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Guard de rutas de invitados
function GuestRoute() {
  const { user } = useAuth();
  return !user ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  const [showCookies, setShowCookies] = useState(false);

  // Mostrar el modal si NO está aceptado o expirado
  useEffect(() => {
    setShowCookies(!isCookiesAccepted());
  }, []);

  // Cada vez que se acepta, ocultar modal y actualizar expiración
  const handleCookiesAccept = () => {
    setShowCookies(false);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 to-blue-50">
          <Navbar />
          <main className="flex-1 overflow-auto">
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/caregivers" element={<Caregivers />} />
            <Route path="/pet/:id" element={<PetDetail />} />
            <Route path="/user/:id" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />

            {/* Invitados */}
            <Route element={<GuestRoute />}>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Privadas */}
            <Route element={<PrivateRoute />}>
              {/* Aquí tus rutas que requieren login, por ejemplo: */}
              <Route path="/profile" element={<Profile />} />
              {/* ... */}
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {showCookies && <CookiesModal onAccept={handleCookiesAccept} />}
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
