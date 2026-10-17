<?php

namespace Database\Factories;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Teacher> */
class TeacherFactory extends Factory
{
    protected $model = Teacher::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'staff_number' => 'STF-'.fake()->unique()->numberBetween(1000, 999999),
            'qualification' => 'B.Ed',
            'hire_date' => '2022-09-01',
            'status' => 'active',
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Teacher $teacher) {
            $teacher->user->assignRole('teacher');
        });
    }
}
