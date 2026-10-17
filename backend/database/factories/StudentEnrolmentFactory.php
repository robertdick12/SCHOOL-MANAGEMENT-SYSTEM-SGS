<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrolment;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<StudentEnrolment> */
class StudentEnrolmentFactory extends Factory
{
    protected $model = StudentEnrolment::class;

    public function definition(): array
    {
        $schoolClass = SchoolClass::factory()->create();

        return [
            'student_id' => Student::factory(),
            'school_class_id' => $schoolClass->id,
            'academic_year_id' => $schoolClass->academic_year_id,
            'enrolled_at' => '2025-09-01',
            'status' => 'active',
        ];
    }
}
