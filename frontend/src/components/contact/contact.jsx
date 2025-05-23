import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  // Para una app real deberías enviar esto a un backend o a un email
  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    // Aquí puedes implementar integración con un servicio de email o backend
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4 text-purple-700">Contacto</h1>
        <p className="text-gray-700 mb-6">
          ¿Tienes dudas, sugerencias o quieres colaborar con el proyecto? ¡Escríbenos!
        </p>
        {enviado ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            ¡Gracias por tu mensaje! Responderemos lo antes posible.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Mensaje</label>
              <textarea
                name="mensaje"
                rows={4}
                value={form.mensaje}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Enviar mensaje
            </button>
          </form>
        )}
        <div className="mt-6 text-gray-600 text-sm text-center">
          También puedes enviar un correo directo a:{' '}
          <a href="mailto:osc4r.mm.dev@gmail.com" className="text-purple-600 underline">
            osc4r.mm.dev@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;