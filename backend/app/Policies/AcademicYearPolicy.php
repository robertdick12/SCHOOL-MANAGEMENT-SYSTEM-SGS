<?php

namespace App\Policies;

use App\Models\AcademicYear;
use App\Models\User;

class AcademicYearPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, AcademicYear $academicYear): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, AcademicYear $academicYear): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, AcademicYear $academicYear): bool
    {
        return $user->hasRole('admin');
    }
}
