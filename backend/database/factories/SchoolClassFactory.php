<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SchoolClass> */
class SchoolClassFactory extends Factory
{
    protected $model = SchoolClass::class;

    public function definition(): array
    {
        return [
            'name' => 'Class '.fake()->unique()->bothify('?#'),
            'academic_year_id' => AcademicYear::factory(),
            'capacity' => 30,
        ];
    }
}
