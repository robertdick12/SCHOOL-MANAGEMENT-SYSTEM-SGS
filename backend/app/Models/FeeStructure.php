<?php

namespace App\Models;

use App\Policies\FeeStructurePolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[UsePolicy(FeeStructurePolicy::class)]
#[Fillable(['name', 'fee_type', 'school_class_id', 'academic_term_id', 'amount_pesewas', 'description'])]
class FeeStructure extends Model
{
    use HasFactory;

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }
}
