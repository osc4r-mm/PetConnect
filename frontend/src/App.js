import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PetDetail from './components/PetDetail';

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
            <Route path="/pet/:id" element={<PetDetail />} />

          {/* Rutas de invitado: sólo si NO hay sesión */}
          <Route element={<GuestRoute />}>
            {/* Rutas sin navbar */}
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