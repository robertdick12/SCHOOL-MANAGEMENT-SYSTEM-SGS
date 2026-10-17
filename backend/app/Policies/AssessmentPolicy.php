<?php

namespace App\Policies;

use App\Models\Assessment;
use App\Models\User;

class AssessmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Assessment $assessment): bool
    {
        if ($this->manages($user, $assessment)) {
            return true;
        }

        if (! $assessment->is_published) {
            return false;
        }

        if ($user->hasRole('student')) {
            return $user->student?->currentEnrolment()?->school_class_id === $assessment->school_class_id;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->students
                ->contains(fn ($student) => $student->currentEnrolment()?->school_class_id === $assessment->school_class_id) ?? false;
        }

        return false;
    }

    /**
     * $schoolClassId/$subjectId are omitted only for a generic "could this
     * user ever create an assessment" UI check; the controller always
     * passes them once the request is validated, which gates the write.
     */
    public function create(User $user, ?int $schoolClassId = null, ?int $subjectId = null): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if (! $user->hasRole('teacher')) {
            return false;
        }

        if ($schoolClassId === null || $subjectId === null) {
            return true;
        }

        return $user->teacher?->teachesClassSubject($schoolClassId, $subjectId) ?? false;
    }

    public function update(User $user, Assessment $assessment): bool
    {
        return $this->manages($user, $assessment);
    }

    public function delete(User $user, Assessment $assessment): bool
    {
        return $this->manages($user, $assessment);
    }

    public function publish(User $user, Assessment $assessment): bool
    {
        return $this->manages($user, $assessment);
    }

    public function enterResults(User $user, Assessment $assessment): bool
    {
        return $this->manages($user, $assessment);
    }

    private function manages(User $user, Assessment $assessment): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('teacher')
            && ($user->teacher?->teachesClassSubject($assessment->school_class_id, $assessment->subject_id) ?? false);
    }
}
