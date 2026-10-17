<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'accountant', 'student', 'parent']);
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->hasAnyRole(['admin', 'accountant'])) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $user->student?->id === $payment->student_id;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->isGuardianOf($payment->student) ?? false;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'accountant']);
    }
}
