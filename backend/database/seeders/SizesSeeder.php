<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Size;

class SizesSeeder extends Seeder
{
    public function run()
    {
        Size::insert([
            ['id' => 1, 'name' => 'Pequeño'],
            ['id' => 2, 'name' => 'Mediano'],
            ['id' => 3, 'name' => 'Grande'],
        ]);
    }
}
