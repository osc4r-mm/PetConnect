import React from 'react';
import { PawPrint } from 'lucide-react';

export default function Badge({ text, color }) {
  return <span className={`inline-block bg-${color}-500 text-white px-2 py-1 rounded-full text-xs`}>{text}</span>;
}

// Componente para cuando carga la pagina (con mensaje personalizado)
export const LoadingScreen = ({ message }) => (
  <div className="flex flex-col items-center mt-40">
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
const NotFoundData = ({ message, icon, redirectUrl }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="flex flex-col items-center">
      {icon}
      <p className="mt-4 text-lg font-medium text-blue-700">{message}</p>
      <a href={redirectUrl} className="mt-2 text-blue-500 hover:underline">
        Volver a la página principal
      </a>
    </div>
  </div>
);