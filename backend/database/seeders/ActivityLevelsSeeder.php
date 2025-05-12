<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityLevel;

class ActivityLevelsSeeder extends Seeder
{
    public function run()
    {
        ActivityLevel::insert([
            ['id' => 1, 'name' => 'Bajo'],
            ['id' => 2, 'name' => 'Medio'],
            ['id' => 3, 'name' => 'Alto'],
        ]);
    }
}
