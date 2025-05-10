import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)}
        className="block w-full mb-3 p-2 border rounded" required />
      <input type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)}
        className="block w-full mb-3 p-2 border rounded" required />
      <button type="submit" className="px-4 py-2 border rounded">Entrar</button>
    </form>
  );
}
