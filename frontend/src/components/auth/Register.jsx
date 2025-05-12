import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // ✅ usar el contexto

const Register = () => {
  const { register } = useAuth(); // ✅ accedemos al método desde el contexto
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const evaluatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return score;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = useMemo(() => evaluatePasswordStrength(formData.password), [formData.password]);
  const strengthLabels = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabel = strengthLabels[strength];
  const strengthColor = strengthColors[strength];
  const strengthPercent = (strength / (strengthLabels.length - 1)) * 100;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Las contraseñas no coinciden');
      setIsSubmitting(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      const apiError = err?.message || 'Error al registrar';
      setErrorMessage(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit} noValidate>
          {/* Nombre */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">
              Nombre Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Tu nombre"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="correo@ejemplo.com"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          {/* Contraseña */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} className="text-gray-500" /> : <Eye size={16} className="text-gray-500" />}
              </button>
            </div>

            {/* Medidor de seguridad */}
            {formData.password && (
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 ${strengthColor} transition-all duration-300 ease-in-out`}
                    style={{ width: `${strengthPercent}%` }}
                  />
                </div>
                <p className="text-xs mt-1 text-gray-600">
                  Seguridad: <span className={`font-medium ${strength === 0 ? 'text-red-500' : strength < 3 ? 'text-yellow-600' : 'text-green-600'}`}>{strengthLabel}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="mb-4">
            <label htmlFor="password_confirmation" className="block text-gray-700 text-sm font-medium mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={handleInputChange}
                placeholder="********"
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={16} className="text-gray-500" /> : <Eye size={16} className="text-gray-500" />}
              </button>
            </div>

            {formData.password_confirmation && formData.password !== formData.password_confirmation && (
              <p className="text-xs mt-1 text-red-500">
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
