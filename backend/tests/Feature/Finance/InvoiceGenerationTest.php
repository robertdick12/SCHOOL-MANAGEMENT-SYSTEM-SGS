<?php

use App\Models\AcademicTerm;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrolment;
use App\Models\User;
use App\Services\InvoiceService;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('sums multiple fee structures (class-specific and school-wide) into one invoice total', function () {
    $schoolClass = SchoolClass::factory()->create();
    $term = AcademicTerm::factory()->create();
    $student = Student::factory()->create();
    StudentEnrolment::create([
        'student_id' => $student->id,
        'school_class_id' => $schoolClass->id,
        'academic_year_id' => $schoolClass->academic_year_id,
        'enrolled_at' => '2025-09-01',
    ]);

    FeeStructure::factory()->create([
        'name' => 'Tuition', 'fee_type' => 'tuition',
        'school_class_id' => $schoolClass->id, 'academic_term_id' => $term->id, 'amount_pesewas' => 50000,
    ]);
    FeeStructure::factory()->create([
        'name' => 'PTA levy', 'fee_type' => 'other',
        'school_class_id' => null, 'academic_term_id' => $term->id, 'amount_pesewas' => 2000,
    ]);
    // A fee for a different class must NOT be included.
    FeeStructure::factory()->create([
        'name' => 'Other class tuition', 'fee_type' => 'tuition',
        'school_class_id' => SchoolClass::factory()->create()->id, 'academic_term_id' => $term->id, 'amount_pesewas' => 99999,
    ]);

    $invoice = app(InvoiceService::class)->generateForStudent($student, $term);

    expect($invoice->total_amount_pesewas)->toBe(52000)
        ->and($invoice->amount_paid_pesewas)->toBe(0)
        ->and($invoice->status)->toBe('unpaid')
        ->and($invoice->items)->toHaveCount(2);
});

it('refuses to generate an invoice for a student with no current class enrolment', function () {
    $term = AcademicTerm::factory()->create();
    $student = Student::factory()->create();

    expect(fn () => app(InvoiceService::class)->generateForStudent($student, $term))
        ->toThrow(RuntimeException::class);
});

it('refuses to generate an invoice when no fee structures apply', function () {
    $schoolClass = SchoolClass::factory()->create();
    $term = AcademicTerm::factory()->create();
    $student = Student::factory()->create();
    StudentEnrolment::create([
        'student_id' => $student->id,
        'school_class_id' => $schoolClass->id,
        'academic_year_id' => $schoolClass->academic_year_id,
        'enrolled_at' => '2025-09-01',
    ]);

    expect(fn () => app(InvoiceService::class)->generateForStudent($student, $term))
        ->toThrow(RuntimeException::class);
});

it('rejects invoice generation requests from unauthorized roles over the API', function () {
    $term = AcademicTerm::factory()->create();
    $student = Student::factory()->withLogin()->create();

    // Authorization happens inside the controller body after FormRequest
    // validation, so the IDs must be valid — this isolates the test to the
    // role check rather than accidentally asserting a 422 instead.
    $this->actingAs($student->user)
        ->postJson('/api/v1/invoices/generate', ['student_id' => $student->id, 'academic_term_id' => $term->id])
        ->assertForbidden();
});

it('assigns unique sequential invoice numbers', function () {
    $schoolClass = SchoolClass::factory()->create();
    $term = AcademicTerm::factory()->create();
    FeeStructure::factory()->create(['school_class_id' => $schoolClass->id, 'academic_term_id' => $term->id]);

    $students = Student::factory()->count(3)->create();
    foreach ($students as $student) {
        StudentEnrolment::create([
            'student_id' => $student->id, 'school_class_id' => $schoolClass->id,
            'academic_year_id' => $schoolClass->academic_year_id, 'enrolled_at' => '2025-09-01',
        ]);
    }

    $numbers = $students->map(fn ($s) => app(InvoiceService::class)->generateForStudent($s, $term)->invoice_number);

    expect($numbers->unique())->toHaveCount(3);
});
