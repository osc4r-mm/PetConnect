import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Guard para rutas privadas
function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Guard para rutas de invitados
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
          {/* Rutas neutrales: accesibles siempre */}
            <Route path="/" element={<Home />} />

          {/* Rutas de invitado: sólo si NO hay sesión */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Rutas privadas: sólo si HAY sesión */}
          <Route element={<PrivateRoute />}>
          </Route>

          {/* Cualquier otra, redirige a Home (o a Login) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


// hola