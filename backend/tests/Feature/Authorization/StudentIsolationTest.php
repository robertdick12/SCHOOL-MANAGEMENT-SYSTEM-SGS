<?php

use App\Models\Student;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('lets a student view their own record', function () {
    $studentA = Student::factory()->withLogin()->create();

    $this->actingAs($studentA->user)
        ->getJson("/api/v1/students/{$studentA->id}")
        ->assertOk()
        ->assertJsonPath('id', $studentA->id);
});

it('blocks a student from viewing another student\'s record (IDOR)', function () {
    $studentA = Student::factory()->withLogin()->create();
    $studentB = Student::factory()->withLogin()->create();

    $this->actingAs($studentA->user)
        ->getJson("/api/v1/students/{$studentB->id}")
        ->assertForbidden();
});

it('blocks a student from viewing another student\'s results', function () {
    $studentA = Student::factory()->withLogin()->create();
    $studentB = Student::factory()->withLogin()->create();

    $this->actingAs($studentA->user)
        ->getJson("/api/v1/students/{$studentB->id}/results")
        ->assertForbidden();
});

it('blocks a student from viewing another student\'s attendance', function () {
    $studentA = Student::factory()->withLogin()->create();
    $studentB = Student::factory()->withLogin()->create();

    $this->actingAs($studentA->user)
        ->getJson("/api/v1/students/{$studentB->id}/attendance")
        ->assertForbidden();
});

it('blocks a student from registering new students', function () {
    $student = Student::factory()->withLogin()->create();

    $this->actingAs($student->user)
        ->postJson('/api/v1/students', [
            'admission_number' => 'HACK-001',
            'first_name' => 'Evil',
            'last_name' => 'Hacker',
            'admission_date' => '2025-09-01',
        ])
        ->assertForbidden();
});

it('blocks a student from listing all teachers', function () {
    $student = Student::factory()->withLogin()->create();

    $this->actingAs($student->user)
        ->getJson('/api/v1/teachers')
        ->assertForbidden();
});

it('returns 404 rather than leaking existence for an impossible student id', function () {
    $student = Student::factory()->withLogin()->create();

    $this->actingAs($student->user)
        ->getJson('/api/v1/students/999999999')
        ->assertNotFound();
});
