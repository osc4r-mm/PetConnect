<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class PetPhotoSeeder extends Seeder
{
    public function run()
    {
        DB::table('pet_photos')->truncate();

        $now = Carbon::now();

        // Escoge aleatoriamente, por ejemplo, 50 pets para tener fotos
        $petsWithPhotos = Pet::inRandomOrder()->get();

        foreach ($petsWithPhotos as $pet) {
            // Dale entre 1 y 5 fotos a cada uno
            $num = rand(0, 3);
            for ($i = 1; $i <= $num; $i++) {
                DB::table('pet_photos')->insert([
                    'pet_id'      => $pet->id,
                    'image_path'  => "https://placedog.net/400/300?id={$pet->id}-{$i}",
                    'uploaded_at' => $now->copy()->subDays(rand(0, 30)),
                ]);
            }
        }
    }
}
