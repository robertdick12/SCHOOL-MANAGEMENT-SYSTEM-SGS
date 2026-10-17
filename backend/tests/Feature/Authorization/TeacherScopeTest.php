<?php

use App\Models\AcademicTerm;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrolment;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherClassSubject;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function assignTeacherToClass(Teacher $teacher, SchoolClass $schoolClass, Subject $subject): TeacherClassSubject
{
    return TeacherClassSubject::create([
        'teacher_id' => $teacher->id,
        'school_class_id' => $schoolClass->id,
        'subject_id' => $subject->id,
        'academic_term_id' => AcademicTerm::factory()->create()->id,
    ]);
}

it('lets a teacher view a student in their assigned class', function () {
    $teacher = Teacher::factory()->create();
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create();
    assignTeacherToClass($teacher, $schoolClass, $subject);

    $student = Student::factory()->create();
    StudentEnrolment::create([
        'student_id' => $student->id,
        'school_class_id' => $schoolClass->id,
        'academic_year_id' => $schoolClass->academic_year_id,
        'enrolled_at' => '2025-09-01',
    ]);

    $this->actingAs($teacher->user)
        ->getJson("/api/v1/students/{$student->id}")
        ->assertOk();
});

it('blocks a teacher from viewing a student in a class they do not teach', function () {
    $teacher = Teacher::factory()->create();

    $unrelatedClass = SchoolClass::factory()->create();
    $student = Student::factory()->create();
    StudentEnrolment::create([
        'student_id' => $student->id,
        'school_class_id' => $unrelatedClass->id,
        'academic_year_id' => $unrelatedClass->academic_year_id,
        'enrolled_at' => '2025-09-01',
    ]);

    $this->actingAs($teacher->user)
        ->getJson("/api/v1/students/{$student->id}")
        ->assertForbidden();
});

it('blocks a teacher from creating an assessment for a class/subject they are not assigned to', function () {
    $teacher = Teacher::factory()->create();
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create();
    $term = AcademicTerm::factory()->create();
    // Note: no TeacherClassSubject assignment created for this teacher.

    $this->actingAs($teacher->user)
        ->postJson('/api/v1/assessments', [
            'name' => 'Sneaky Quiz',
            'type' => 'quiz',
            'subject_id' => $subject->id,
            'school_class_id' => $schoolClass->id,
            'academic_term_id' => $term->id,
            'max_score' => 100,
        ])
        ->assertForbidden();
});

it('lets a teacher create and publish an assessment for their own class/subject', function () {
    $teacher = Teacher::factory()->create();
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create();
    $term = AcademicTerm::factory()->create();
    assignTeacherToClass($teacher, $schoolClass, $subject);

    $response = $this->actingAs($teacher->user)->postJson('/api/v1/assessments', [
        'name' => 'Legit Quiz',
        'type' => 'quiz',
        'subject_id' => $subject->id,
        'school_class_id' => $schoolClass->id,
        'academic_term_id' => $term->id,
        'max_score' => 100,
    ])->assertCreated();

    $assessmentId = $response->json('id');

    $this->actingAs($teacher->user)
        ->postJson("/api/v1/assessments/{$assessmentId}/publish")
        ->assertOk()
        ->assertJsonPath('is_published', true);
});

it('blocks a teacher from publishing another teacher\'s assessment', function () {
    $owner = Teacher::factory()->create();
    $intruder = Teacher::factory()->create();
    $schoolClass = SchoolClass::factory()->create();
    $subject = Subject::factory()->create();
    $term = AcademicTerm::factory()->create();
    assignTeacherToClass($owner, $schoolClass, $subject);

    $assessment = \App\Models\Assessment::create([
        'name' => 'Owners Quiz', 'type' => 'quiz', 'subject_id' => $subject->id,
        'school_class_id' => $schoolClass->id, 'academic_term_id' => $term->id, 'max_score' => 100,
    ]);

    $this->actingAs($intruder->user)
        ->postJson("/api/v1/assessments/{$assessment->id}/publish")
        ->assertForbidden();
});
