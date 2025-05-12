<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Breed;

class BreedsSeeder extends Seeder
{
    public function run()
    {
        Breed::insert([
            // Perros
            ['id' => 1, 'name' => 'Labrador',  'species_id' => 1],
            ['id' => 2, 'name' => 'Beagle',     'species_id' => 1],
            ['id' => 3, 'name' => 'Bulldog',    'species_id' => 1],
            ['id' => 4, 'name' => 'Chihuahua',  'species_id' => 1],
            ['id' => 5, 'name' => 'Poodle',     'species_id' => 1],
            ['id' => 6, 'name' => 'Schnauzer',  'species_id' => 1],
            ['id' => 7, 'name' => 'Golden Retriever', 'species_id' => 1],
            ['id' => 8, 'name' => 'Rottweiler', 'species_id' => 1],
            ['id' => 9, 'name' => 'Dachshund',  'species_id' => 1],
            ['id' => 10, 'name' => 'Yorkshire Terrier', 'species_id' => 1],
            // Gatos
            ['id' => 11, 'name' => 'Persa',     'species_id' => 2],
            ['id' => 12, 'name' => 'Siamés',    'species_id' => 2],
            ['id' => 13, 'name' => 'Maine',    'species_id' => 2],
            ['id' => 14, 'name' => 'Bengalí',   'species_id' => 2],
            ['id' => 15, 'name' => 'Sphynx',    'species_id' => 2],
            ['id' => 16, 'name' => 'Ragdoll',   'species_id' => 2],
            ['id' => 17, 'name' => 'British Shorthair', 'species_id' => 2],
            ['id' => 18, 'name' => 'Scottish Fold',    'species_id' => 2],
            ['id' => 19, 'name' => 'Abyssinian', 'species_id' => 2],
            ['id' => 20, 'name' => 'Norwegian Forest', 'species_id' => 2],
            // Conejos
            ['id' => 21, 'name' => 'Holland Lop', 'species_id' => 3],
            ['id' => 22, 'name' => 'Netherland Dwarf', 'species_id' => 3],
            ['id' => 23, 'name' => 'Mini Rex',   'species_id' => 3],
            ['id' => 24, 'name' => 'Lionhead',   'species_id' => 3],
            ['id' => 25, 'name' => 'English Angora', 'species_id' => 3],
            ['id' => 26, 'name' => 'Himalayan',  'species_id' => 3],
            ['id' => 27, 'name' => 'Dutch',      'species_id' => 3],
            ['id' => 28, 'name' => 'English Spot', 'species_id' => 3],
            ['id' => 29, 'name' => 'American',   'species_id' => 3],
            ['id' => 30, 'name' => 'French Lop',  'species_id' => 3],
            // Hámsters
            ['id' => 31, 'name' => 'Siberiano',  'species_id' => 4],
            ['id' => 32, 'name' => 'Dwarf Campbell', 'species_id' => 4],
            ['id' => 33, 'name' => 'Ruso',       'species_id' => 4],
            ['id' => 34, 'name' => 'Chino',      'species_id' => 4],
            ['id' => 35, 'name' => 'Roborovski',  'species_id' => 4],
            ['id' => 36, 'name' => 'Sirio',      'species_id' => 4],
            ['id' => 37, 'name' => 'Doradito',   'species_id' => 4],
            ['id' => 38, 'name' => 'Bicolor',    'species_id' => 4],
            ['id' => 39, 'name' => 'Albino',     'species_id' => 4],
            ['id' => 40, 'name' => 'Golden',     'species_id' => 4],
            // Tortugas
            ['id' => 41, 'name' => 'Tortuga de orejas rojas', 'species_id' => 5],
            ['id' => 42, 'name' => 'Tortuga de caja',       'species_id' => 5],
            ['id' => 43, 'name' => 'Tortuga de tierra',     'species_id' => 5],
            ['id' => 44, 'name' => 'Tortuga de agua dulce', 'species_id' => 5],
            ['id' => 45, 'name' => 'Tortuga de mar',        'species_id' => 5],
            ['id' => 46, 'name' => 'Tortuga pintada',       'species_id' => 5],
            ['id' => 47, 'name' => 'Tortuga de caparazón blando', 'species_id' => 5],
            ['id' => 48, 'name' => 'Tortuga de espolones',   'species_id' => 5],
            ['id' => 49, 'name' => 'Tortuga de río',         'species_id' => 5],
            ['id' => 50, 'name' => 'Tortuga de patas rojas',  'species_id' => 5],
            // Pájaros
            ['id' => 51, 'name' => 'Periquito',  'species_id' => 6],
            ['id' => 52, 'name' => 'Canario',    'species_id' => 6],
            ['id' => 53, 'name' => 'Cacatúa',    'species_id' => 6],
            ['id' => 54, 'name' => 'Agapornis',  'species_id' => 6],
            ['id' => 55, 'name' => 'Loro',       'species_id' => 6],
            ['id' => 56, 'name' => 'Jilguero',   'species_id' => 6],
            ['id' => 57, 'name' => 'Cotorra',    'species_id' => 6],
            ['id' => 58, 'name' => 'Pinzón',     'species_id' => 6],
            ['id' => 59, 'name' => 'Bengalí',    'species_id' => 6],
            ['id' => 60, 'name' => 'Diamante de Gould',   'species_id' => 6],
            // Peces
            ['id' => 61, 'name' => 'Betta',      'species_id' => 7],
            ['id' => 62, 'name' => 'Guppy',      'species_id' => 7],
            ['id' => 63, 'name' => 'Neón',       'species_id' => 7],
            ['id' => 64, 'name' => 'Corydora',   'species_id' => 7],
            ['id' => 65, 'name' => 'Oscar',      'species_id' => 7],
            ['id' => 66, 'name' => 'Pez ángel',  'species_id' => 7],
            ['id' => 67, 'name' => 'Pez payaso', 'species_id' => 7],
            ['id' => 68, 'name' => 'Tetra',      'species_id' => 7],
            ['id' => 69, 'name' => 'Pez cebra',  'species_id' => 7],
            ['id' => 70, 'name' => 'Pez loro',   'species_id' => 7],
            // Serpientes
            ['id' => 71, 'name' => 'Pitón bola', 'species_id' => 8],
            ['id' => 72, 'name' => 'Reina',      'species_id' => 8],
            ['id' => 73, 'name' => 'Coral',      'species_id' => 8],
            ['id' => 74, 'name' => 'Cobra',      'species_id' => 8],
            ['id' => 75, 'name' => 'Serpiente de maíz', 'species_id' => 8],
            ['id' => 76, 'name' => 'Boa constrictor',   'species_id' => 8],
            ['id' => 77, 'name' => 'Serpiente de cascabel', 'species_id' => 8],
            ['id' => 78, 'name' => 'Serpiente rey',     'species_id' => 8],
            ['id' => 79, 'name' => 'Serpiente de agua',   'species_id' => 8],
            ['id' => 80, 'name' => 'Serpiente de leche',   'species_id' => 8],
            // Otros
            ['id' => 81, 'name' => 'Otro',       'species_id' => 9],
        ]);
    }
}
