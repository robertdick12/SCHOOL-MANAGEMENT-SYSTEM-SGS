<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherClassSubject;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TeacherClassSubject> */
class TeacherClassSubjectFactory extends Factory
{
    protected $model = TeacherClassSubject::class;

    public function definition(): array
    {
        return [
            'teacher_id' => Teacher::factory(),
            'school_class_id' => SchoolClass::factory(),
            'subject_id' => Subject::factory(),
            'academic_term_id' => AcademicTerm::factory(),
        ];
    }
}
