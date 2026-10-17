<?php

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;

class AnnouncementPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Announcement $announcement): bool
    {
        if ($user->hasRole('admin') || $user->id === $announcement->created_by) {
            return true;
        }

        return $announcement->isPublished() && $this->inAudience($user, $announcement);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'teacher']);
    }

    public function update(User $user, Announcement $announcement): bool
    {
        return $user->hasRole('admin') || $user->id === $announcement->created_by;
    }

    public function delete(User $user, Announcement $announcement): bool
    {
        return $user->hasRole('admin') || $user->id === $announcement->created_by;
    }

    private function inAudience(User $user, Announcement $announcement): bool
    {
        if ($announcement->audience === 'all') {
            return true;
        }

        if (! $user->hasRole($announcement->audience)) {
            return false;
        }

        if ($announcement->school_class_id === null) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $user->student?->currentEnrolment()?->school_class_id === $announcement->school_class_id;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->students
                ->contains(fn ($student) => $student->currentEnrolment()?->school_class_id === $announcement->school_class_id) ?? false;
        }

        return true;
    }
}
