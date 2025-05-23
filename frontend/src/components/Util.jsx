import React from 'react';
import { PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Badge con color personalizado (usa sólo colores de tailwind, ej: purple, blue, red...)
export default function Badge({ text, color = "purple" }) {
  return (
    <span className={`inline-block bg-${color}-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow`}>
      {text}
    </span>
  );
}

// LoadingScreen: pantalla de carga animada
export const LoadingScreen = ({ message }) => (
  <div className="h-full flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50">
    <div className="relative w-16 h-16 animate-spin">
      <PawPrint className="absolute top-0 animate-bounce text-blue-900" size={20} />
      <PawPrint className="absolute top-0 right-0 animate-bounce text-red-900" size={20} />
      <PawPrint className="absolute bottom-0 animate-bounce text-yellow-900" size={20} />
      <PawPrint className="absolute bottom-0 right-0 animate-bounce text-green-900" size={20} />
    </div>
    <p className="mt-4 text-lg font-semibold text-purple-700">{message}</p>
  </div>
);

// NotFoundData: pantalla de "no encontrado" o error
export const NotFoundData = ({
  message1 = 'No encontrado',
  message2 = '',
  icon = PawPrint,
  redirectUrl = '/',
  redirectMessage = 'Volver al inicio'
}) => {
  const navigate = useNavigate();

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { size: 64, className: 'text-purple-200' });
    }
    const IconComp = icon;
    return IconComp ? <IconComp size={64} className="text-purple-200" /> : null;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50">
      <div className="flex flex-col items-center">
        {renderIcon()}
        <h2 className="mt-4 text-2xl font-bold text-purple-700">{message1}</h2>
        {message2 && <p className="mt-2 text-gray-600">{message2}</p>}
        <button
          onClick={() => navigate(redirectUrl)}
          className="mt-6 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 shadow transition"
        >
          {redirectMessage}
        </button>
      </div>
    </div>
  );
};