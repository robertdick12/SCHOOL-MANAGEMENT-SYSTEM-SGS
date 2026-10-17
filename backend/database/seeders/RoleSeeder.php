<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public const ROLES = ['admin', 'teacher', 'student', 'parent', 'accountant'];

    public function run(): void
    {
        foreach (self::ROLES as $role) {
            Role::query()->firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }
}
