<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Breed;

class BreedsSeeder extends Seeder
{
    public function run()
    {
        Breed::insert([
            ['id' => 1, 'name' => 'Labrador',  'species_id' => 1],
            ['id' => 2, 'name' => 'Beagle',     'species_id' => 1],
            ['id' => 3, 'name' => 'Bulldog',    'species_id' => 1],
            ['id' => 4, 'name' => 'Chihuahua',  'species_id' => 1],
            // Si quieres razas de gato, agrégalas aquí con species_id = 2
        ]);
    }
}
