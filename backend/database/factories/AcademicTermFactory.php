<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AcademicTerm> */
class AcademicTermFactory extends Factory
{
    protected $model = AcademicTerm::class;

    public function definition(): array
    {
        return [
            'academic_year_id' => AcademicYear::factory(),
            'name' => 'Term '.fake()->unique()->numberBetween(1, 1000),
            'start_date' => '2025-09-01',
            'end_date' => '2025-12-12',
            'is_current' => true,
        ];
    }
}
