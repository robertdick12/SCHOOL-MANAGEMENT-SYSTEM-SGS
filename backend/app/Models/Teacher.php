<?php

namespace App\Models;

use App\Policies\TeacherPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UsePolicy(TeacherPolicy::class)]
#[Fillable(['user_id', 'staff_number', 'qualification', 'hire_date', 'status'])]
class Teacher extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function classAssignments(): HasMany
    {
        return $this->hasMany(TeacherClassSubject::class);
    }

    public function classesAsHomeroomTeacher(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'class_teacher_id');
    }

    public function timetableEntries(): HasMany
    {
        return $this->hasMany(TimetableEntry::class);
    }

    public function teachesClass(int $schoolClassId): bool
    {
        return $this->classAssignments()->where('school_class_id', $schoolClassId)->exists()
            || $this->classesAsHomeroomTeacher()->whereKey($schoolClassId)->exists();
    }

    public function teachesClassSubject(int $schoolClassId, int $subjectId): bool
    {
        return $this->classAssignments()
            ->where('school_class_id', $schoolClassId)
            ->where('subject_id', $subjectId)
            ->exists();
    }

    public function teachesStudent(Student $student): bool
    {
        $enrolment = $student->currentEnrolment();

        return $enrolment !== null && $this->teachesClass($enrolment->school_class_id);
    }
}
