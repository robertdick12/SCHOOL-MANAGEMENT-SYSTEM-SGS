<?php

namespace App\Models;

use App\Policies\GuardianPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[UsePolicy(GuardianPolicy::class)]
#[Fillable(['user_id', 'first_name', 'last_name', 'phone', 'email', 'address', 'occupation'])]
class Guardian extends Model
{
    use HasFactory;

    public function fullName(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'guardian_student')
            ->using(GuardianStudent::class)
            ->withPivot(['relationship', 'is_primary_contact'])
            ->withTimestamps();
    }

    public function isGuardianOf(Student $student): bool
    {
        return $this->students()->whereKey($student->id)->exists();
    }
}
