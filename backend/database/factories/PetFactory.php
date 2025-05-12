<?php

namespace Database\Factories;

use App\Models\Pet;
use Illuminate\Database\Eloquent\Factories\Factory;

class PetFactory extends Factory
{
    protected $model = Pet::class;

    public function definition(): array
    {
        // Generamos aquí el profile_path (o lo dejamos null)
        $profilePath = null;
        if ($this->faker->boolean(80)) { // 80% de probabilidad de tener imagen
            $id = $this->faker->numberBetween(1, 100);
            $profilePath = "https://placedog.net/400/300?id={$id}";
        }

        return [
            // Campos obligatorios
            'name'               => $this->faker->firstName(),
            'age'                => $this->faker->numberBetween(1, 15),
            'gender_id'          => $this->faker->numberBetween(1, 2),
            'weight'             => $this->faker->randomFloat(2, 1, 40), // decimal(5,2)

            // Campos opcionales en la migración
            'description'        => $this->faker->optional()->paragraph(),
            'profile_path'       => $profilePath,

            // Booleans con default
            'for_adoption'       => $this->faker->boolean(20),
            'for_sitting'        => $this->faker->boolean(80),

            // Relaciones
            'species_id'         => $this->faker->numberBetween(1, 2),
            'breed_id'           => $this->faker->optional()->numberBetween(1, 4),
            'size_id'            => $this->faker->optional()->numberBetween(1, 3),
            'activity_level_id'  => $this->faker->optional()->numberBetween(1, 3),
            'noise_level_id'     => $this->faker->optional()->numberBetween(1, 3),

            // registered_at usa CURRENT_TIMESTAMP por defecto en la migración, no es necesario definirlo aquí
        ];
    }
}
