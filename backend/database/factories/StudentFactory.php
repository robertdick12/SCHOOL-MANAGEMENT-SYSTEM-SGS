<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Student> */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'admission_number' => 'ADM-'.fake()->unique()->numberBetween(100000, 999999),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'date_of_birth' => '2013-01-01',
            'gender' => fake()->randomElement(['male', 'female']),
            'admission_date' => '2025-09-01',
            'status' => 'active',
        ];
    }

    public function withLogin(): static
    {
        return $this->state(fn () => ['user_id' => User::factory()])
            ->afterCreating(function (Student $student) {
                $student->user->assignRole('student');
            });
    }
}
