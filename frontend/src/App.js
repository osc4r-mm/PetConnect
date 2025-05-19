// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { LoadingScreen } from './components/Util';
import Login     from './components/auth/Login';
import Register  from './components/auth/Register';
import Navbar    from './components/navbar/Navbar';
import Home      from './components/home/Home';
import PetDetail from './components/pets/PetDetail';
import Profile   from './components/UserProfile/Profile';

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
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col h-screen bg-gray-100">
          <Navbar />
          <main className="flex-1 overflow-auto">
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/pet/:id" element={<PetDetail />} />
              <Route path="/user/:id" element={<Profile />} />

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
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
