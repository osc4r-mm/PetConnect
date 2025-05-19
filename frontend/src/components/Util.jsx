import React from 'react';
import { PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Badge({ text, color }) {
  return <span className={`inline-block bg-${color}-500 text-white px-2 py-1 rounded-full text-xs`}>{text}</span>;
}

// Componente para cuando carga la pagina (con mensaje personalizado)
export const LoadingScreen = ({ message }) => (
    <div className="h-full flex flex-1 flex-col items-center justify-center">
            <div className="relative w-16 h-16 animate-spin">
            <PawPrint className="absolute top-0 animate-bounce text-blue-900" size={20} />
            <PawPrint className="absolute top-0 right-0 animate-bounce text-red-900" size={20} />
            <PawPrint className="absolute bottom-0 animate-bounce text-yellow-900" size={20} />
            <PawPrint className="absolute bottom-0 right-0 animate-bounce text-green-900" size={20} />
            </div>
      <p className="mt-4 text-lg font-medium text-blue-700">{message}</p>
    </div>
);

// Componente para cuando no se encuentra la informacion (pudiendo elegir los mensajes e icono y la pagina a la que redirije)
export const NotFoundData = ({
  message1 = 'No encontrado',
  message2 = '',
  icon = PawPrint,
  redirectUrl = '/',
  redirectMessage = 'Volver al inicio'
}) => {
  const navigate = useNavigate();

  const renderIcon = () => {
    // Si es un elemento React, clonamos y le damos tamaño/clase
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { size: 64, className: 'text-gray-400' });
    }
    // Si es un componente, lo instanciamos
    const IconComp = icon;
    return IconComp ? <IconComp size={64} className="text-gray-400" /> : null;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        {renderIcon()}
        <h2 className="mt-4 text-2xl font-bold text-gray-700">{message1}</h2>
        {message2 && <p className="mt-2 text-gray-600">{message2}</p>}
        <button
          onClick={() => navigate(redirectUrl)}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {redirectMessage}
        </button>
      </div>
    </div>
  );
};