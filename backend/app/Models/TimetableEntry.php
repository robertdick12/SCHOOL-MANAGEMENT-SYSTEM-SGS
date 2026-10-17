<?php

namespace App\Models;

use App\Policies\TimetableEntryPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[UsePolicy(TimetableEntryPolicy::class)]
#[Fillable(['school_class_id', 'subject_id', 'teacher_id', 'academic_term_id', 'day_of_week', 'start_time', 'end_time', 'room'])]
class TimetableEntry extends Model
{
    use HasFactory;

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }
}
