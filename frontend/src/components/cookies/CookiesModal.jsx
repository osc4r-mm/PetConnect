import React, { useCallback } from "react";

const COOKIE_KEY = "cookies_accepted";
const COOKIE_EXP_DAYS = 7;

// Calcula si la cookie está aceptada y no expirada
function isCookiesAccepted() {
  try {
    const data = JSON.parse(localStorage.getItem(COOKIE_KEY));
    if (!data?.accepted) return false;
    const now = Date.now();
    return now < data.accepted_at + COOKIE_EXP_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

// Guarda la aceptación y la fecha actual
function setCookiesAccepted() {
  localStorage.setItem(
    COOKIE_KEY,
    JSON.stringify({ accepted: true, accepted_at: Date.now() })
  );
}

export default function CookiesModal({ onAccept }) {
  // Si el usuario acepta, actualizamos la fecha y cerramos el modal
  const handleAccept = useCallback(() => {
    setCookiesAccepted();
    if (onAccept) onAccept();
  }, [onAccept]);

  // Fondo oscuro y modal centrado, el modal NO se puede cerrar de otra forma
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-100/90 to-blue-100/80"
      style={{
        background: "rgba(80,70,180,0.10)",
        backdropFilter: "blur(3px)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 border-2 border-green-100 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-2 text-green-700">Tu privacidad es importante</h2>
        <p className="mb-5 text-gray-700">
          Utilizamos cookies para mejorar tu experiencia. Puedes aceptar todas las cookies o solo las necesarias para el buen funcionamiento de la web.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex-1 font-semibold shadow transition"
            onClick={handleAccept}
          >
            Acepto todo
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex-1 font-semibold shadow transition"
            onClick={handleAccept}
          >
            Acepto necesarias
          </button>
        </div>
        <p className="text-xs mt-4 text-gray-400 text-center">
          Puedes cambiar tu configuración de cookies en cualquier momento.
        </p>
      </div>
    </div>
  );
}

// Exporta la función para usarla en App
export { isCookiesAccepted, setCookiesAccepted };