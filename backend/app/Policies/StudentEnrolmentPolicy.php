<?php

namespace App\Policies;

use App\Models\StudentEnrolment;
use App\Models\User;

class StudentEnrolmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'teacher', 'accountant']);
    }

    public function view(User $user, StudentEnrolment $studentEnrolment): bool
    {
        return app(StudentPolicy::class)->view($user, $studentEnrolment->student);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, StudentEnrolment $studentEnrolment): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, StudentEnrolment $studentEnrolment): bool
    {
        return $user->hasRole('admin');
    }
}
