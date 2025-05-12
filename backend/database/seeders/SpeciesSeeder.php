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
        ]);
    }
}
