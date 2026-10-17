<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AcademicYear> */
class AcademicYearFactory extends Factory
{
    protected $model = AcademicYear::class;

    public function definition(): array
    {
        $startYear = fake()->unique()->numberBetween(2020, 2099);

        return [
            'name' => "{$startYear}/".($startYear + 1),
            'start_date' => "{$startYear}-09-01",
            'end_date' => ($startYear + 1).'-07-31',
            'is_current' => true,
        ];
    }
}
