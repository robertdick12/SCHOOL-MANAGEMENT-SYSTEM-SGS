<?php

namespace App\Services;

use App\Models\AcademicTerm;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InvoiceService
{
    /**
     * Build an invoice for a student from the fee structures that apply to
     * their current class (plus any school-wide fees) for the given term.
     */
    public function generateForStudent(Student $student, AcademicTerm $academicTerm, ?User $createdBy = null): Invoice
    {
        $enrolment = $student->currentEnrolment();

        if (! $enrolment) {
            throw new RuntimeException('Student has no active class enrolment for the current academic year.');
        }

        $feeStructures = FeeStructure::query()
            ->where('academic_term_id', $academicTerm->id)
            ->where(function ($query) use ($enrolment) {
                $query->whereNull('school_class_id')
                    ->orWhere('school_class_id', $enrolment->school_class_id);
            })
            ->get();

        if ($feeStructures->isEmpty()) {
            throw new RuntimeException('No fee structures are configured for this class and term.');
        }

        return DB::transaction(function () use ($student, $academicTerm, $feeStructures, $createdBy) {
            $invoice = Invoice::create([
                'invoice_number' => $this->nextInvoiceNumber(),
                'student_id' => $student->id,
                'academic_term_id' => $academicTerm->id,
                'status' => 'unpaid',
                'issued_at' => now(),
                'created_by' => $createdBy?->id,
            ]);

            foreach ($feeStructures as $feeStructure) {
                $invoice->items()->create([
                    'fee_structure_id' => $feeStructure->id,
                    'description' => $feeStructure->name,
                    'amount_pesewas' => $feeStructure->amount_pesewas,
                ]);
            }

            $this->recalculateTotals($invoice);

            return $invoice->refresh();
        });
    }

    /**
     * Recompute total/paid/status from the invoice's line items and
     * allocations. Always called inside a transaction by the caller when
     * items or allocations change, so the invoice never drifts out of sync.
     */
    public function recalculateTotals(Invoice $invoice): void
    {
        $total = (int) $invoice->items()->sum('amount_pesewas');
        $paid = (int) $invoice->allocations()->sum('amount_pesewas');

        $status = match (true) {
            $paid <= 0 => 'unpaid',
            $paid >= $total => 'paid',
            default => 'partial',
        };

        $invoice->update([
            'total_amount_pesewas' => $total,
            'amount_paid_pesewas' => $paid,
            'status' => $status,
        ]);
    }

    private function nextInvoiceNumber(): string
    {
        $year = now()->format('Y');
        $sequence = Invoice::query()->whereYear('created_at', $year)->count() + 1;

        return sprintf('INV-%s-%05d', $year, $sequence);
    }
}
