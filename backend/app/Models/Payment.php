<?php

namespace App\Models;

use App\Models\Concerns\LogsAudits;
use App\Policies\PaymentPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UsePolicy(PaymentPolicy::class)]
#[Fillable([
    'student_id', 'amount_pesewas', 'method', 'provider', 'provider_reference',
    'status', 'received_by', 'paid_at', 'notes',
])]
class Payment extends Model
{
    use HasFactory, LogsAudits;

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    public function unallocatedPesewas(): int
    {
        return $this->amount_pesewas - $this->allocations()->sum('amount_pesewas');
    }
}
