<?php

namespace App\Policies;

use App\Models\SchoolClass;
use App\Models\User;

class SchoolClassPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SchoolClass $schoolClass): bool
    {
        if ($user->hasAnyRole(['admin', 'accountant'])) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $user->teacher?->teachesClass($schoolClass->id) ?? false;
        }

        if ($user->hasRole('student')) {
            return $user->student?->currentEnrolment()?->school_class_id === $schoolClass->id;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->students
                ->contains(fn ($student) => $student->currentEnrolment()?->school_class_id === $schoolClass->id) ?? false;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, SchoolClass $schoolClass): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, SchoolClass $schoolClass): bool
    {
        return $user->hasRole('admin');
    }
}
