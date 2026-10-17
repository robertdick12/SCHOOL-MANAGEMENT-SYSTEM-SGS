<?php

namespace App\Models;

use App\Policies\ExamPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[UsePolicy(ExamPolicy::class)]
#[Fillable([
    'title', 'subject_id', 'school_class_id', 'academic_term_id',
    'exam_date', 'start_time', 'end_time', 'venue', 'instructions',
    'is_published', 'created_by',
])]
class Exam extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'exam_date' => 'date',
            'is_published' => 'boolean',
        ];
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
