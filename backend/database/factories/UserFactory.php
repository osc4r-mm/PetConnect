<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Role;

class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => bcrypt('password'),
            'gender_id' => $this->faker->numberBetween(1, 2),
            'age' => $this->faker->numberBetween(18, 80),
            'description' => $this->faker->text(200),
            'wallet_balance' => $this->faker->randomFloat(2, 0, 1000),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'image' => $this->faker->imageUrl(200, 200, 'people'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indica que el usuario es una perrera.
     */
    public function shelter(): static
    {
        return $this->state(function (array $attributes) {
            // Buscamos el rol de admin
            $adminRole = Role::where('name', 'admin')->first();
            
            return [
                'name' => 'Refugio de Animales',
                'email' => 'shelter@petconnect.com',
                'password' => bcrypt('admin'),
                'gender_id' => '1',
                'age' => $this->faker->numberBetween(2, 10),
                'description' => 'Refugio dedicado al cuidado de mascotas en adopción.',
                'wallet_balance' => 0,
                'image' => 'https://placedog.net/200/200?random=' . rand(1, 100),
                'role_id' => $adminRole?->id,
            ];
        });
    }

    /**
     * Indica que se trata de un usuario sin verificar.
     */
    public function unverified(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'email_verified_at' => null,
            ];
        });
    }
}