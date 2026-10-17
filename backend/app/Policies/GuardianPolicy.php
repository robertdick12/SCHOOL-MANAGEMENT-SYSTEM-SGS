<?php

namespace App\Policies;

use App\Models\Guardian;
use App\Models\User;

class GuardianPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'accountant', 'teacher']);
    }

    public function view(User $user, Guardian $guardian): bool
    {
        if ($user->hasAnyRole(['admin', 'accountant'])) {
            return true;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->id === $guardian->id;
        }

        if ($user->hasRole('teacher')) {
            return $guardian->students->contains(
                fn ($student) => $user->teacher?->teachesStudent($student) ?? false
            );
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, Guardian $guardian): bool
    {
        return $user->hasRole('admin') || $user->guardianProfile?->id === $guardian->id;
    }

    public function delete(User $user, Guardian $guardian): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Linking/unlinking which students a guardian can see is deliberately
     * admin-only and separate from update() — update() also authorizes a
     * parent editing their own contact details, and that must never be
     * allowed to double as permission to self-link to arbitrary students.
     */
    public function linkStudents(User $user, Guardian $guardian): bool
    {
        return $user->hasRole('admin');
    }
}
