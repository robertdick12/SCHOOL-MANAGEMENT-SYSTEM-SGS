<?php

namespace App\Models;

use App\Policies\AcademicYearPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UsePolicy(AcademicYearPolicy::class)]
#[Fillable(['name', 'start_date', 'end_date', 'is_current'])]
class AcademicYear extends Model
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

    public function terms(): HasMany
    {
        return $this->hasMany(AcademicTerm::class);
    }

    public function schoolClasses(): HasMany
    {
        return $this->hasMany(SchoolClass::class);
    }

    public static function current(): ?self
    {
        return static::query()->where('is_current', true)->first();
    }
}
