<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'teacher', 'accountant']);
    }

    public function view(User $user, Student $student): bool
    {
        if ($user->hasAnyRole(['admin', 'accountant'])) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $user->teacher?->teachesStudent($student) ?? false;
        }

        if ($user->hasRole('student')) {
            return $user->student?->id === $student->id;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->isGuardianOf($student) ?? false;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, Student $student): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->hasRole('admin');
    }
}
