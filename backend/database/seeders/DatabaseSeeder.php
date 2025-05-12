<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pet;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            GendersSeeder::class,
            SpeciesSeeder::class,
            BreedsSeeder::class,
            SizesSeeder::class,
            ActivityLevelsSeeder::class,
            NoiseLevelsSeeder::class
        ]);

        Pet::factory()->count(20)->create();
    }
}
