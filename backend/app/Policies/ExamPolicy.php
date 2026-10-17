<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Exam $exam): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $user->teacher?->teachesClassSubject($exam->school_class_id, $exam->subject_id) ?? false;
        }

        // Students and parents may only see published exam schedules.
        if (! $exam->is_published) {
            return false;
        }

        if ($user->hasRole('student')) {
            return $user->student?->currentEnrolment()?->school_class_id === $exam->school_class_id;
        }

        if ($user->hasRole('parent')) {
            return $user->guardianProfile?->students
                ->contains(fn ($student) => $student->currentEnrolment()?->school_class_id === $exam->school_class_id) ?? false;
        }

        return false;
    }

    /**
     * $schoolClassId/$subjectId are omitted only for a generic "could this
     * user ever create an exam" UI check; the controller always passes them
     * once the request is validated, which is what actually gates the write.
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

    public function update(User $user, Exam $exam): bool
    {
        return $this->manages($user, $exam);
    }

    public function delete(User $user, Exam $exam): bool
    {
        return $this->manages($user, $exam);
    }

    public function publish(User $user, Exam $exam): bool
    {
        return $this->manages($user, $exam);
    }

    private function manages(User $user, Exam $exam): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('teacher')
            && ($user->teacher?->teachesClassSubject($exam->school_class_id, $exam->subject_id) ?? false);
    }
}
