<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PaymentService
{
    public function __construct(private readonly InvoiceService $invoices)
    {
    }

    /**
     * Record a manually-collected payment (cash, bank transfer, etc.).
     * Manual payments are verified immediately because a staff member is
     * physically attesting to having received the funds; provider-initiated
     * payments (Mobile Money/card) must instead come in as 'pending' and be
     * flipped to 'verified' only by a provider webhook/callback — see
     * PaymentGatewayInterface.
     */
    public function recordManualPayment(
        Student $student,
        int $amountPesewas,
        string $method,
        User $receivedBy,
        ?string $notes = null,
    ): Payment {
        if ($amountPesewas <= 0) {
            throw new RuntimeException('Payment amount must be greater than zero.');
        }

        return Payment::create([
            'student_id' => $student->id,
            'amount_pesewas' => $amountPesewas,
            'method' => $method,
            'provider' => 'manual',
            'status' => 'verified',
            'received_by' => $receivedBy->id,
            'paid_at' => now(),
            'notes' => $notes,
        ]);
    }

    /**
     * Allocate part (or all) of a verified payment to one invoice.
     * Locks both rows for the duration of the transaction so two concurrent
     * allocations can never jointly over-allocate the same payment or
     * over-pay the same invoice.
     */
    public function allocate(Payment $payment, Invoice $invoice, int $amountPesewas): void
    {
        if ($amountPesewas <= 0) {
            throw new RuntimeException('Allocation amount must be greater than zero.');
        }

        DB::transaction(function () use ($payment, $invoice, $amountPesewas) {
            /** @var Payment $lockedPayment */
            $lockedPayment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();

            if ($lockedPayment->status !== 'verified') {
                throw new RuntimeException('Only verified payments can be allocated.');
            }

            /** @var Invoice $lockedInvoice */
            $lockedInvoice = Invoice::query()->whereKey($invoice->id)->lockForUpdate()->firstOrFail();

            $unallocated = $lockedPayment->amount_pesewas - $lockedPayment->allocations()->sum('amount_pesewas');
            if ($amountPesewas > $unallocated) {
                throw new RuntimeException('Allocation exceeds the payment\'s unallocated balance.');
            }

            $outstanding = $lockedInvoice->total_amount_pesewas - $lockedInvoice->amount_paid_pesewas;
            if ($amountPesewas > $outstanding) {
                throw new RuntimeException('Allocation exceeds the invoice\'s outstanding balance.');
            }

            $lockedInvoice->allocations()->create([
                'payment_id' => $lockedPayment->id,
                'amount_pesewas' => $amountPesewas,
            ]);

            $this->invoices->recalculateTotals($lockedInvoice);
        });
    }

    /**
     * Convenience: allocate a payment across a student's outstanding
     * invoices, oldest-first, until the payment or the balances run out.
     */
    public function autoAllocate(Payment $payment): void
    {
        $remaining = $payment->amount_pesewas - $payment->allocations()->sum('amount_pesewas');

        if ($remaining <= 0) {
            return;
        }

        $invoices = Invoice::query()
            ->where('student_id', $payment->student_id)
            ->whereIn('status', ['unpaid', 'partial'])
            ->orderBy('issued_at')
            ->get();

        foreach ($invoices as $invoice) {
            if ($remaining <= 0) {
                break;
            }

            $outstanding = $invoice->total_amount_pesewas - $invoice->amount_paid_pesewas;
            if ($outstanding <= 0) {
                continue;
            }

            $toAllocate = min($remaining, $outstanding);
            $this->allocate($payment, $invoice, $toAllocate);
            $remaining -= $toAllocate;
        }
    }
}
