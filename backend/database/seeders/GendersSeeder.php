<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Gender;

class GendersSeeder extends Seeder
{
    public function run()
    {
        Gender::insert([
            ['id' => 1, 'name' => 'Macho'],
            ['id' => 2, 'name' => 'Hembra'],
        ]);
    }
}
