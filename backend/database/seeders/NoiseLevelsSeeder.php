<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NoiseLevel;

class NoiseLevelsSeeder extends Seeder
{
    public function run()
    {
        NoiseLevel::insert([
            ['id' => 1, 'name' => 'Silencioso'],
            ['id' => 2, 'name' => 'Moderado'],
            ['id' => 3, 'name' => 'Ruidoso'],
        ]);
    }
}
