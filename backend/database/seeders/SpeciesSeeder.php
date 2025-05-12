<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Species;

class SpeciesSeeder extends Seeder
{
    public function run()
    {
        Species::insert([
            ['id' => 1, 'name' => 'Perro'],
            ['id' => 2, 'name' => 'Gato'],
            ['id' => 3, 'name' => 'Conejo'],
            ['id' => 4, 'name' => 'Hámster'],
            ['id' => 5, 'name' => 'Tortuga'],
            ['id' => 6, 'name' => 'Pájaro'],
            ['id' => 7, 'name' => 'Pez'],
            ['id' => 8, 'name' => 'Serpiente'],
            ['id' => 9, 'name' => 'Otro'],
        ]);
    }
}
