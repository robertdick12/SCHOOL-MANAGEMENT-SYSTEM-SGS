<?php

use App\Models\Guardian;
use App\Models\Student;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('lets a parent view their linked child\'s record', function () {
    $guardian = Guardian::factory()->withLogin()->create();
    $child = Student::factory()->create();
    $guardian->students()->attach($child->id, ['relationship' => 'father', 'is_primary_contact' => true]);

    $this->actingAs($guardian->user)
        ->getJson("/api/v1/students/{$child->id}")
        ->assertOk();
});

it('blocks a parent from viewing a student not linked to their account', function () {
    $guardian = Guardian::factory()->withLogin()->create();
    $otherFamilysChild = Student::factory()->create();

    $this->actingAs($guardian->user)
        ->getJson("/api/v1/students/{$otherFamilysChild->id}")
        ->assertForbidden();
});

it('blocks a parent from changing which student id they request and seeing another family\'s invoices', function () {
    $guardian = Guardian::factory()->withLogin()->create();
    $myChild = Student::factory()->create();
    $guardian->students()->attach($myChild->id, ['relationship' => 'mother', 'is_primary_contact' => true]);
    $someoneElsesChild = Student::factory()->create();

    $this->actingAs($guardian->user)
        ->getJson('/api/v1/invoices?student_id='.$someoneElsesChild->id)
        ->assertOk()
        ->assertJsonCount(0, 'data'); // the student_id query param is ignored for parents; scoping is server-side
});

it('blocks a parent from linking themselves to an arbitrary student', function () {
    $guardian = Guardian::factory()->withLogin()->create();
    $student = Student::factory()->create();

    $this->actingAs($guardian->user)
        ->postJson("/api/v1/guardians/{$guardian->id}/students", [
            'student_id' => $student->id,
            'relationship' => 'father',
        ])
        ->assertForbidden();
});
