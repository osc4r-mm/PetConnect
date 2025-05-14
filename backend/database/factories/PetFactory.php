<?php

namespace Database\Factories;

use App\Models\Pet;
use App\Models\Breed;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class PetFactory extends Factory
{
    protected $model = Pet::class;

    public function definition(): array
    {
        // Primero seleccionamos la especie para poder elegir razas compatibles
        $speciesId = $this->faker->numberBetween(1, 9);
        
        // Generamos el profile_path con imagen de perro
        $profilePath = null;
        $id = $this->faker->numberBetween(1, 100);
        $profilePath = "https://placedog.net/400/300?id={$id}";
        
        // Obtenemos una raza compatible con la especie seleccionada
        $breedId = null;
        // Obtenemos IDs de razas compatibles con la especie
        $compatibleBreeds = Breed::where('species_id', $speciesId)->pluck('id')->toArray();
        if (!empty($compatibleBreeds)) {
            $breedId = $this->faker->randomElement($compatibleBreeds);
        }

        return [
            // Campos obligatorios
            'name'               => $this->faker->firstName(),
            'age'                => $this->faker->numberBetween(1, 15),
            'gender_id'          => $this->faker->numberBetween(1, 2),
            'weight'             => $this->faker->randomFloat(2, 1, 40),
            'profile_path'       => $profilePath,
            
            // Campos opcionales en la migración
            'description'        => $this->faker->optional()->paragraph(),
            'breed_id'           => $breedId,
            'size_id'            => $this->faker->optional()->numberBetween(1, 3),
            'activity_level_id'  => $this->faker->optional()->numberBetween(1, 3),
            'noise_level_id'     => $this->faker->optional()->numberBetween(1, 3),
            
            // Booleans con default
            'for_adoption' => $this->faker->boolean(50),
            'for_sitting' => $this->faker->boolean(80),
            
            // Relaciones
            'species_id' => $speciesId,
            'user_id' => User::find(1)?->id ?? User::factory(),
        ];
    }
}