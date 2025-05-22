import React from 'react';

const About = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full">
      <h1 className="text-3xl font-bold mb-4 text-purple-700">Acerca de PetConnect</h1>
      <p className="text-gray-700 mb-4">
        <strong>PetConnect</strong> es una plataforma que conecta a dueños de mascotas con cuidadores y adoptantes apasionados por el bienestar animal. Nuestro objetivo es facilitar la adopción responsable y el cuidado temporal de mascotas, creando una comunidad segura y confiable.
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>Publica mascotas en adopción o en búsqueda de cuidador.</li>
        <li>Solicita adoptar o cuidar a una mascota con un clic.</li>
        <li>Gestiona tus solicitudes, notificaciones y perfiles fácilmente.</li>
        <li>Fomenta la colaboración y el compromiso con el bienestar animal.</li>
      </ul>
      <p className="text-gray-600 mb-2">
        PetConnect ha sido creada por <a className="text-purple-600 underline" href="https://github.com/osc4r-mm" target="_blank" rel="noopener noreferrer">Oscar M.M.</a> como parte de un proyecto personal con el fin de ayudar a las mascotas a encontrar un hogar o los mejores cuidados cuando sus familias lo necesitan.
      </p>
      <p className="text-gray-600">
        ¿Tienes sugerencias o deseas colaborar? Visita nuestra página de <a href="/contact" className="text-purple-600 underline">contacto</a>.
      </p>
    </div>
  </div>
);

export default About;