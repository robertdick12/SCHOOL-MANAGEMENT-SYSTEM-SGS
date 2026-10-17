<?php

namespace App\Models;

use App\Policies\AcademicTermPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[UsePolicy(AcademicTermPolicy::class)]
#[Fillable(['academic_year_id', 'name', 'start_date', 'end_date', 'is_current'])]
class AcademicTerm extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_current' => 'boolean',
        ];
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public static function current(): ?self
    {
        return static::query()->where('is_current', true)->first();
    }
}
