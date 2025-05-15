// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login     from './components/auth/Login';
import Register  from './components/auth/Register';
import Navbar    from './components/Navbar';
import Home      from './components/Home';
import PetDetail from './components/pets/PetDetail';
import Profile   from './components/Profile';

// Guard de rutas privadas
function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Guard de rutas de invitados
function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return !user ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/pet/:id" element={<PetDetail />} />

          {/* Invitados */}
          <Route element={<GuestRoute />}>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Privadas */}
          <Route element={<PrivateRoute />}>
            {/* Aquí tus rutas que requieren login, por ejemplo: */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:id" element={<Profile />} />
            {/* ... */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
