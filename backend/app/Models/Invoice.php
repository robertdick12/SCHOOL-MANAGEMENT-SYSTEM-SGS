<?php

namespace App\Models;

use App\Models\Concerns\LogsAudits;
use App\Policies\InvoicePolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UsePolicy(InvoicePolicy::class)]
#[Fillable([
    'invoice_number', 'student_id', 'academic_term_id', 'total_amount_pesewas',
    'amount_paid_pesewas', 'status', 'due_date', 'issued_at', 'created_by',
])]
class Invoice extends Model
{
    use HasFactory, LogsAudits;

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'issued_at' => 'datetime',
        ];
    }

    protected function outstandingPesewas(): Attribute
    {
        return Attribute::get(fn () => $this->total_amount_pesewas - $this->amount_paid_pesewas);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
