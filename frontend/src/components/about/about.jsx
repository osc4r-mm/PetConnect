import React from 'react';
import { Heart, PawPrint, Users, Home, Smile, Shield } from 'lucide-react';

const values = [
  {
    icon: <Heart className="text-red-500" size={32} />,
    title: "Amor y Respeto Animal",
    desc: "Creemos que cada mascota merece cariño, respeto y un hogar donde sentirse segura."
  },
  {
    icon: <Users className="text-blue-500" size={32} />,
    title: "Comunidad Activa",
    desc: "Fomentamos la colaboración entre adoptantes, dueños y cuidadores para el bienestar común."
  },
  {
    icon: <PawPrint className="text-green-500" size={32} />,
    title: "Adopción Responsable",
    desc: "Facilitamos la adopción y el cuidado temporal, promoviendo la responsabilidad y el compromiso."
  },
  {
    icon: <Shield className="text-green-600" size={32} />,
    title: "Seguridad y Confianza",
    desc: "Priorizamos la seguridad y privacidad de los usuarios y de las mascotas en cada paso."
  },
  {
    icon: <Smile className="text-yellow-500" size={32} />,
    title: "Experiencia Amigable",
    desc: "Hacemos que la gestión de tus mascotas sea sencilla, cercana y agradable."
  }
];

const About = () => (
  <div className="flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-50">
    <div className="bg-white shadow-xl rounded-2xl max-w-3xl w-full animate-fadeIn">

      <h1 className="text-4xl font-extrabold mb-2 text-center text-green-700 tracking-tight">
        Acerca de PetConnect
      </h1>

      <p className="text-xl text-gray-700 mb-6 text-center">
        <strong>PetConnect</strong> conecta a dueños, cuidadores y adoptantes en una comunidad comprometida con el bienestar animal.<br className="hidden sm:inline" />
        Nuestro objetivo: hacer fácil la adopción y el cuidado temporal, ¡creando historias felices para mascotas y personas!
      </p>

      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-gradient-to-t from-green-50 to-white rounded-xl shadow-md p-4 w-48 hover:scale-105 transition"
          >
            {v.icon}
            <h3 className="font-bold text-md mt-2 mb-1 text-center text-green-800">{v.title}</h3>
            <p className="text-xs text-gray-600 text-center">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 my-4" />

      <ul className="list-disc list-inside text-gray-700 mb-4 text-base leading-relaxed space-y-2">
        <li><span className="font-semibold">Publica</span> mascotas en adopción o en búsqueda de cuidador.</li>
        <li><span className="font-semibold">Solicita</span> adoptar o cuidar a una mascota con un solo clic.</li>
        <li><span className="font-semibold">Gestiona</span> solicitudes, notificaciones y tu perfil de forma sencilla.</li>
        <li><span className="font-semibold">Contribuye</span> a mejorar vidas fomentando la colaboración y la responsabilidad.</li>
      </ul>

      <div className="mb-3 text-center">
        <span className="inline-block text-gray-600 mb-2">
          Proyecto realizado por <a className="text-green-700 underline font-medium" href="https://github.com/osc4r-mm" target="_blank" rel="noopener noreferrer">Oscar M.M.</a>
        </span>
        <br />
        <span className="inline-block text-gray-600">
          ¿Tienes sugerencias o quieres colaborar? Visita la página de <a href="/contact" className="text-green-600 underline font-medium">contacto</a>.
        </span>
      </div>
    </div>
  </div>
);

export default About;