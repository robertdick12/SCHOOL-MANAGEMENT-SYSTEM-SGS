<?php

namespace App\Models;

use App\Policies\AnnouncementPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[UsePolicy(AnnouncementPolicy::class)]
#[Fillable(['title', 'body', 'audience', 'school_class_id', 'published_at', 'created_by'])]
class Announcement extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->isPast();
    }
}
