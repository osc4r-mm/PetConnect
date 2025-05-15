import React from 'react';
import { Calendar } from 'lucide-react';

export default function ScheduleSection() {
    return (
        <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 text-blue-600" /> Horario semanal
        </h2>
        {/* Aquí tu tabla de horario */}
        <div className="bg-gray-50 p-4 rounded-lg">
            {/* Ejemplo placeholder */}
            <p className="text-gray-500">Tabla de horario próximamente</p>
        </div>
        </section>
    );
}