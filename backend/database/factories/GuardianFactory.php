<?php

namespace Database\Factories;

use App\Models\Guardian;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Guardian> */
class GuardianFactory extends Factory
{
    protected $model = Guardian::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone' => fake()->unique()->numerify('+2332########'),
        ];
    }

    public function withLogin(): static
    {
        return $this->state(fn () => ['user_id' => User::factory()])
            ->afterCreating(function (Guardian $guardian) {
                $guardian->user->assignRole('parent');
            });
    }
}
