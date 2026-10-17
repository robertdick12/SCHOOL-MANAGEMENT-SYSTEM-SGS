<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use App\Models\Assessment;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Assessment> */
class AssessmentFactory extends Factory
{
    protected $model = Assessment::class;

    public function definition(): array
    {
        return [
            'name' => 'Quiz '.fake()->unique()->numberBetween(1, 100000),
            'type' => 'quiz',
            'subject_id' => Subject::factory(),
            'school_class_id' => SchoolClass::factory(),
            'academic_term_id' => AcademicTerm::factory(),
            'max_score' => 100,
            'is_published' => false,
        ];
    }
}
