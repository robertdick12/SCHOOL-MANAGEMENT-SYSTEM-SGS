<?php

namespace App\Models;

use App\Policies\SchoolClassPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UsePolicy(SchoolClassPolicy::class)]
#[Fillable(['name', 'academic_year_id', 'class_teacher_id', 'capacity'])]
class SchoolClass extends Model
{
    use HasFactory;

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'class_teacher_id');
    }

    public function enrolments(): HasMany
    {
        return $this->hasMany(StudentEnrolment::class);
    }

    public function timetableEntries(): HasMany
    {
        return $this->hasMany(TimetableEntry::class);
    }

    public function teacherAssignments(): HasMany
    {
        return $this->hasMany(TeacherClassSubject::class);
    }
}
