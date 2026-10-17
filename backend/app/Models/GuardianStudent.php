<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Fillable(['guardian_id', 'student_id', 'relationship', 'is_primary_contact'])]
class GuardianStudent extends Pivot
{
    protected $table = 'guardian_student';

    public $incrementing = true;

    protected function casts(): array
    {
        return [
            'is_primary_contact' => 'boolean',
        ];
    }

    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Guardian::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
