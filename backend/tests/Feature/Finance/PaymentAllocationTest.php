<?php

use App\Models\AcademicTerm;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrolment;
use App\Models\User;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function makeInvoicedStudent(int $amountPesewas = 50000): Student
{
    $schoolClass = SchoolClass::factory()->create();
    $term = AcademicTerm::factory()->create();
    $student = Student::factory()->create();
    StudentEnrolment::create([
        'student_id' => $student->id, 'school_class_id' => $schoolClass->id,
        'academic_year_id' => $schoolClass->academic_year_id, 'enrolled_at' => '2025-09-01',
    ]);
    FeeStructure::factory()->create([
        'school_class_id' => $schoolClass->id, 'academic_term_id' => $term->id, 'amount_pesewas' => $amountPesewas,
    ]);
    app(InvoiceService::class)->generateForStudent($student, $term);

    return $student->fresh();
}

it('marks an invoice partial after a partial payment and paid after full payment', function () {
    $student = makeInvoicedStudent(50000);
    $staff = User::factory()->create();

    $payments = app(PaymentService::class);
    $payment1 = $payments->recordManualPayment($student, 20000, 'cash', $staff);
    $payments->autoAllocate($payment1);

    $invoice = Invoice::where('student_id', $student->id)->first();
    expect($invoice->status)->toBe('partial')
        ->and($invoice->amount_paid_pesewas)->toBe(20000);

    $payment2 = $payments->recordManualPayment($student, 30000, 'cash', $staff);
    $payments->autoAllocate($payment2);

    $invoice->refresh();
    expect($invoice->status)->toBe('paid')
        ->and($invoice->amount_paid_pesewas)->toBe(50000);
});

it('never allocates more than a payment\'s unallocated balance', function () {
    $student = makeInvoicedStudent(50000);
    $staff = User::factory()->create();
    $invoice = Invoice::where('student_id', $student->id)->first();

    $payment = app(PaymentService::class)->recordManualPayment($student, 10000, 'cash', $staff);

    expect(fn () => app(PaymentService::class)->allocate($payment, $invoice, 10001))
        ->toThrow(RuntimeException::class);
});

it('never allocates more than an invoice\'s outstanding balance', function () {
    $student = makeInvoicedStudent(50000);
    $staff = User::factory()->create();
    $invoice = Invoice::where('student_id', $student->id)->first();

    $payment = app(PaymentService::class)->recordManualPayment($student, 60000, 'cash', $staff);

    expect(fn () => app(PaymentService::class)->allocate($payment, $invoice, 60000))
        ->toThrow(RuntimeException::class);
});

it('cannot allocate the same payment to the same invoice twice at the database level', function () {
    $student = makeInvoicedStudent(50000);
    $staff = User::factory()->create();
    $invoice = Invoice::where('student_id', $student->id)->first();
    $payment = app(PaymentService::class)->recordManualPayment($student, 50000, 'cash', $staff);

    app(PaymentService::class)->allocate($payment, $invoice, 10000);

    // A second allocation of the *same payment* to the *same invoice* is
    // exactly what the unique(payment_id, invoice_id) constraint exists to
    // stop — attempting it must fail, not quietly double the credit.
    expect(fn () => DB::table('payment_allocations')->insert([
        'payment_id' => $payment->id, 'invoice_id' => $invoice->id, 'amount_pesewas' => 10000,
        'created_at' => now(), 'updated_at' => now(),
    ]))->toThrow(Illuminate\Database\QueryException::class);
});

it('rejects a duplicate payment provider reference at the database level', function () {
    Payment::create([
        'student_id' => Student::factory()->create()->id, 'amount_pesewas' => 1000, 'method' => 'mobile_money',
        'provider' => 'paystack', 'provider_reference' => 'PSK-DUPLICATE-123', 'status' => 'verified', 'paid_at' => now(),
    ]);

    expect(fn () => Payment::create([
        'student_id' => Student::factory()->create()->id, 'amount_pesewas' => 1000, 'method' => 'mobile_money',
        'provider' => 'paystack', 'provider_reference' => 'PSK-DUPLICATE-123', 'status' => 'verified', 'paid_at' => now(),
    ]))->toThrow(Illuminate\Database\QueryException::class);
});

it('allocates a payment across two outstanding invoices oldest-first via autoAllocate', function () {
    $schoolClass = SchoolClass::factory()->create();
    $term1 = AcademicTerm::factory()->create();
    $term2 = AcademicTerm::factory()->create();
    $student = Student::factory()->create();
    StudentEnrolment::create([
        'student_id' => $student->id, 'school_class_id' => $schoolClass->id,
        'academic_year_id' => $schoolClass->academic_year_id, 'enrolled_at' => '2025-09-01',
    ]);

    FeeStructure::factory()->create(['school_class_id' => $schoolClass->id, 'academic_term_id' => $term1->id, 'amount_pesewas' => 30000]);
    FeeStructure::factory()->create(['school_class_id' => $schoolClass->id, 'academic_term_id' => $term2->id, 'amount_pesewas' => 30000]);

    $olderInvoice = app(InvoiceService::class)->generateForStudent($student, $term1);
    $olderInvoice->forceFill(['issued_at' => now()->subDays(10)])->save();
    $newerInvoice = app(InvoiceService::class)->generateForStudent($student, $term2);

    $staff = User::factory()->create();
    $payment = app(PaymentService::class)->recordManualPayment($student, 40000, 'cash', $staff);
    app(PaymentService::class)->autoAllocate($payment);

    expect($olderInvoice->refresh()->status)->toBe('paid')
        ->and($newerInvoice->refresh()->amount_paid_pesewas)->toBe(10000)
        ->and($newerInvoice->refresh()->status)->toBe('partial');
});

it('never allocates a pending (unverified) payment', function () {
    $student = makeInvoicedStudent(50000);
    $invoice = Invoice::where('student_id', $student->id)->first();

    $pendingPayment = Payment::create([
        'student_id' => $student->id, 'amount_pesewas' => 50000, 'method' => 'mobile_money',
        'provider' => 'paystack', 'provider_reference' => 'PSK-PENDING-1', 'status' => 'pending', 'paid_at' => now(),
    ]);

    expect(fn () => app(PaymentService::class)->allocate($pendingPayment, $invoice, 50000))
        ->toThrow(RuntimeException::class);

    expect($invoice->refresh()->status)->toBe('unpaid');
});
