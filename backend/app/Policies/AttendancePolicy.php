<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;

class AttendancePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'teacher', 'student', 'parent']);
    }

    public function view(User $user, Attendance $attendance): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $user->teacher?->teachesClass($attendance->school_class_id) ?? false;
        }

        if ($user->hasRole('student')) {
            return $user->student?->id === $attendance->student_id;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->isGuardianOf($attendance->student) ?? false;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'teacher']);
    }

    public function update(User $user, Attendance $attendance): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('teacher') && ($user->teacher?->teachesClass($attendance->school_class_id) ?? false);
    }
}
