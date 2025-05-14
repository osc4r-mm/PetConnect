<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::insert([
            ['id' => 1, 'name' => 'user'],
            ['id' => 2, 'name' => 'caregiver'],
            ['id' => 3, 'name' => 'admin']
        ]);
    }
}