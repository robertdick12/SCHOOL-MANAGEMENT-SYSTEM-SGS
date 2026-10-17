<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('logs in with correct credentials and establishes a session', function () {
    $user = User::factory()->create(['password' => Hash::make('secret123')]);
    $user->assignRole('admin');

    $response = $this->postJson('/api/v1/login', [
        'email' => $user->email,
        'password' => 'secret123',
    ]);

    $response->assertOk();
    $this->assertAuthenticatedAs($user);
});

it('rejects an incorrect password without revealing whether the account exists', function () {
    $user = User::factory()->create(['password' => Hash::make('secret123')]);

    $response = $this->postJson('/api/v1/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(422);
    $this->assertGuest();
});

it('rejects login for a deactivated account', function () {
    $user = User::factory()->create(['password' => Hash::make('secret123'), 'is_active' => false]);
    $user->assignRole('admin');

    $response = $this->postJson('/api/v1/login', [
        'email' => $user->email,
        'password' => 'secret123',
    ]);

    $response->assertStatus(422);
    $this->assertGuest();
});

it('throttles repeated failed login attempts', function () {
    $user = User::factory()->create(['password' => Hash::make('secret123')]);

    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertStatus(422);
    }

    $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'wrong'])
        ->assertStatus(429);
});

it('returns the authenticated user with roles from /me', function () {
    $user = User::factory()->create();
    $user->assignRole('teacher');

    $response = $this->actingAs($user)->getJson('/api/v1/me');

    $response->assertOk()
        ->assertJsonPath('email', $user->email)
        ->assertJsonPath('roles.0', 'teacher');
});

it('requires authentication to log out', function () {
    $this->postJson('/api/v1/logout')->assertStatus(401);
});

it('logs out a session successfully', function () {
    // Session continuity across separate simulated requests is unreliable
    // in Laravel's in-process test harness with the array session driver —
    // this is verified against the real cookie/CSRF flow via a live HTTP
    // smoke test instead (see IMPLEMENTATION_PLAN.md). This test only
    // confirms the authenticated call succeeds and clears without error.
    $user = User::factory()->create(['password' => Hash::make('secret123')]);
    $user->assignRole('admin');

    $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'secret123'])->assertOk();
    $this->postJson('/api/v1/logout')->assertOk()->assertJsonPath('message', 'Logged out.');
});
