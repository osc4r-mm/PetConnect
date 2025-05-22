<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pet;
use App\Models\Role;
use App\Models\User;

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
            NoiseLevelsSeeder::class,
            RoleSeeder::class,
        ]);

        // Create 1 admin user
        User::factory()->shelter()->create();
        // Create 500 pets with random data 
        Pet::factory()->count(100)->create([
            'user_id' => User::where('role_id', Role::where('name', 'admin')->first()->id)->first()->id,
        ]);

        $this->call([
            PetPhotoSeeder::class,
        ]);
    }
}
