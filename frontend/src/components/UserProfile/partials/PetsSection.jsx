import React from 'react';
import { Plus } from 'lucide-react';

export default function PetsSection({ pets, onAddPet, editable }) {
    return (
        <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Plus className="mr-2 text-blue-600" /> Mascotas
        </h2>
        <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
            {editable && (
            <div
            className="flex items-center justify-center border-2 border-dashed border-blue-400 rounded-lg h-32 cursor-pointer hover:bg-blue-50 transition"
            onClick={onAddPet}
            >
                <Plus className="w-6 h-6 text-blue-600" />
            </div>
            )}
            {pets.length > 0 ? (
            pets.map(pet => (
                <div key={pet.id} className="relative group rounded-lg overflow-hidden shadow-md cursor-pointer h-32">
                <img
                src={pet.profile_path || 'https://via.placeholder.com/150'}
                alt={pet.name}
                className="object-cover w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    {pet.name}
                </div>
                </div>
            ))
            ) : (
            <p className="col-span-3 text-gray-500">Este usuario aún no tiene mascotas.</p>
            )}
        </div>
        </section>
    );
}