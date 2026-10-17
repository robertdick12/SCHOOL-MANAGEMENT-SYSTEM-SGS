<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'accountant', 'student', 'parent']);
    }

    public function view(User $user, Invoice $invoice): bool
    {
        if ($user->hasAnyRole(['admin', 'accountant'])) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $user->student?->id === $invoice->student_id;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->isGuardianOf($invoice->student) ?? false;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'accountant']);
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['admin', 'accountant']);
    }

    public function cancel(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['admin', 'accountant']);
    }
}
