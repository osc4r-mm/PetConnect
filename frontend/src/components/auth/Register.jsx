import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      setError('Error al registrar');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Register</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input type="text" placeholder="Name" value={name}
        onChange={e => setName(e.target.value)}
        className="block w-full mb-3 p-2 border rounded" required />
      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)}
        className="block w-full mb-3 p-2 border rounded" required />
      <input type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)}
        className="block w-full mb-3 p-2 border rounded" required />
      <button type="submit" className="px-4 py-2 border rounded">Crear cuenta</button>
    </form>
  );
}
