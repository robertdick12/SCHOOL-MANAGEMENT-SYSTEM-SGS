<?php

use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('blocks a teacher from creating another teacher', function () {
    $teacher = Teacher::factory()->create();

    $this->actingAs($teacher->user)
        ->postJson('/api/v1/teachers', [
            'name' => 'New Teacher', 'email' => 'new@school.test',
            'staff_number' => 'STF-9999',
        ])
        ->assertForbidden();
});

it('blocks an accountant from registering students', function () {
    $accountant = User::factory()->create();
    $accountant->assignRole('accountant');

    $this->actingAs($accountant)
        ->postJson('/api/v1/students', [
            'admission_number' => 'ADM-X', 'first_name' => 'X', 'last_name' => 'Y', 'admission_date' => '2025-09-01',
        ])
        ->assertForbidden();
});

it('blocks an accountant from viewing the audit log', function () {
    $accountant = User::factory()->create();
    $accountant->assignRole('accountant');

    $this->actingAs($accountant)->getJson('/api/v1/audit-logs')->assertForbidden();
});

it('blocks a non-admin from deactivating a user account', function () {
    $teacher = Teacher::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($teacher->user)
        ->postJson("/api/v1/users/{$otherUser->id}/toggle-active")
        ->assertForbidden();
});

it('allows an admin to deactivate another user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $target = User::factory()->create();
    $target->assignRole('teacher');

    $this->actingAs($admin)
        ->postJson("/api/v1/users/{$target->id}/toggle-active")
        ->assertOk()
        ->assertJsonPath('is_active', false);

    expect($target->refresh()->is_active)->toBeFalse();
});

it('rejects login for an account deactivated by an admin', function () {
    $target = User::factory()->create(['password' => bcrypt('secret123'), 'is_active' => false]);
    $target->assignRole('teacher');

    $this->postJson('/api/v1/login', ['email' => $target->email, 'password' => 'secret123'])
        ->assertStatus(422);
});

it('prevents an admin from deactivating their own account', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->postJson("/api/v1/users/{$admin->id}/toggle-active")
        ->assertStatus(422);
});

it('rejects unauthenticated requests to every protected resource', function () {
    $this->getJson('/api/v1/students')->assertStatus(401);
    $this->getJson('/api/v1/teachers')->assertStatus(401);
    $this->getJson('/api/v1/invoices')->assertStatus(401);
    $this->getJson('/api/v1/payments')->assertStatus(401);
    $this->getJson('/api/v1/dashboard/admin')->assertStatus(401);
});
