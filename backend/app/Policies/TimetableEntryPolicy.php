<?php

namespace App\Policies;

use App\Models\TimetableEntry;
use App\Models\User;

class TimetableEntryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TimetableEntry $entry): bool
    {
        return app(SchoolClassPolicy::class)->view($user, $entry->schoolClass);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, TimetableEntry $entry): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, TimetableEntry $entry): bool
    {
        return $user->hasRole('admin');
    }
}
