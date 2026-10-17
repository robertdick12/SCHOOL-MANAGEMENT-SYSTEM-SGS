<?php

namespace App\Policies;

use App\Models\AssessmentResult;
use App\Models\User;

class AssessmentResultPolicy
{
    public function view(User $user, AssessmentResult $result): bool
    {
        $assessment = $result->assessment;

        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $user->teacher?->teachesClassSubject($assessment->school_class_id, $assessment->subject_id) ?? false;
        }

        if (! $assessment->is_published) {
            return false;
        }

        if ($user->hasRole('student')) {
            return $user->student?->id === $result->student_id;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->isGuardianOf($result->student) ?? false;
        }

        return false;
    }

    public function update(User $user, AssessmentResult $result): bool
    {
        $assessment = $result->assessment;

        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('teacher')
            && ($user->teacher?->teachesClassSubject($assessment->school_class_id, $assessment->subject_id) ?? false);
    }
}
