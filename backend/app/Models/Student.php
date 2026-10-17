<?php

namespace App\Models;

use App\Policies\StudentPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UsePolicy(StudentPolicy::class)]
#[Fillable([
    'user_id', 'admission_number', 'first_name', 'last_name',
    'date_of_birth', 'gender', 'admission_date', 'status',
])]
class Student extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'admission_date' => 'date',
        ];
    }

    public function fullName(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enrolments(): HasMany
    {
        return $this->hasMany(StudentEnrolment::class);
    }

    public function currentEnrolment(): ?StudentEnrolment
    {
        $currentYear = AcademicYear::current();
        if (! $currentYear) {
            return null;
        }

        return $this->enrolments()
            ->where('academic_year_id', $currentYear->id)
            ->first();
    }

    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(Guardian::class, 'guardian_student')
            ->using(GuardianStudent::class)
            ->withPivot(['relationship', 'is_primary_contact'])
            ->withTimestamps();
    }

    public function assessmentResults(): HasMany
    {
        return $this->hasMany(AssessmentResult::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
