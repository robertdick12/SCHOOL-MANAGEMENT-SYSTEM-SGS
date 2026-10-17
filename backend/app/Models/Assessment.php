<?php

namespace App\Models;

use App\Policies\AssessmentPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UsePolicy(AssessmentPolicy::class)]
#[Fillable([
    'name', 'type', 'subject_id', 'school_class_id', 'academic_term_id',
    'max_score', 'weight', 'is_published', 'created_by',
])]
class Assessment extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'max_score' => 'decimal:2',
            'weight' => 'decimal:2',
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

    public function results(): HasMany
    {
        return $this->hasMany(AssessmentResult::class);
    }
}
