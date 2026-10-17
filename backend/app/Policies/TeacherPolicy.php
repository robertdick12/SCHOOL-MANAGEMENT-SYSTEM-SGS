<?php

namespace App\Policies;

use App\Models\Teacher;
use App\Models\User;

class TeacherPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'accountant']) || $user->hasRole('teacher');
    }

    public function view(User $user, Teacher $teacher): bool
    {
        return $user->hasAnyRole(['admin', 'accountant'])
            || $user->teacher?->id === $teacher->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, Teacher $teacher): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, Teacher $teacher): bool
    {
        return $user->hasRole('admin');
    }
}
