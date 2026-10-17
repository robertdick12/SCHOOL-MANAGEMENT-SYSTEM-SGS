<?php

namespace App\Policies;

use App\Models\TeacherClassSubject;
use App\Models\User;

class TeacherClassSubjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'teacher']);
    }

    public function view(User $user, TeacherClassSubject $assignment): bool
    {
        return $user->hasRole('admin') || $user->teacher?->id === $assignment->teacher_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, TeacherClassSubject $assignment): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, TeacherClassSubject $assignment): bool
    {
        return $user->hasRole('admin');
    }
}
