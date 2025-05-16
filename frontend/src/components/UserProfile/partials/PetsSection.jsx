import React from 'react';
import { Heart, PawPrint, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PetsSection({ pets, onAdd, editable }) {
    return (
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Plus className="mr-2 text-blue-600" /> Mascotas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                {editable && (
                    <div
                        className="flex items-center justify-center border-2 border-dashed border-blue-400 rounded-lg h-32 cursor-pointer hover:bg-blue-50 transition"
                        onClick={onAdd}
                    >
                        <Plus className="w-6 h-6 text-blue-600" />
                    </div>
                )}
                {pets.length > 0 ? (
                    pets.map(pet => (
                        <Link 
                            key={pet.id} 
                            to={`/pet/${pet.id}`} 
                            className="block relative group rounded-lg overflow-hidden shadow-md cursor-pointer h-32 transition transform hover:scale-105"
                        >
                            <img
                                src={pet.profile_path || 'https://via.placeholder.com/150'}
                                alt={pet.name}
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center text-sm p-2">
                                {pet.name}
                            </div>
                            {/* Indicadores para adopción/cuidado */}
                            <div className="absolute top-2 right-2 flex space-x-1">
                                {pet.for_adoption && (
                                    <div className="bg-red-500 p-1 rounded-full"><Heart size={16} className="text-white" /></div>
                                )}
                                {pet.for_sitting && (
                                    <div className="bg-blue-500 p-1 rounded-full"><PawPrint size={16} className="text-white" /></div>
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="col-span-full text-gray-500">Este usuario aún no tiene mascotas.</p>
                )}
            </div>
        </section>
    );
}