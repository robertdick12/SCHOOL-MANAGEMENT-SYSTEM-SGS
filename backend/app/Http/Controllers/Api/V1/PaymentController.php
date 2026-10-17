<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RecordPaymentRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $user = $request->user();
        $query = Payment::query()->with(['student', 'receivedBy']);

        if ($user->hasRole('student')) {
            $query->where('student_id', $user->student?->id);
        } elseif ($user->hasRole('parent')) {
            $studentIds = $user->guardianProfile?->students->pluck('id') ?? [];
            $query->whereIn('student_id', $studentIds);
        } elseif ($studentId = $request->integer('student_id')) {
            $query->where('student_id', $studentId);
        }

        return response()->json($query->orderByDesc('paid_at')->paginate($request->integer('per_page', 25)));
    }

    /**
     * Record a manual payment and, unless a specific invoice is given,
     * automatically allocate it across the student's outstanding invoices.
     */
    public function store(RecordPaymentRequest $request): JsonResponse
    {
        $this->authorize('create', Payment::class);

        $student = Student::findOrFail($request->input('student_id'));

        try {
            $payment = $this->payments->recordManualPayment(
                $student,
                $request->integer('amount_pesewas'),
                $request->input('method'),
                $request->user(),
                $request->input('notes'),
            );

            if ($invoiceId = $request->input('invoice_id')) {
                $this->payments->allocate($payment, Invoice::findOrFail($invoiceId), $payment->amount_pesewas);
            } else {
                $this->payments->autoAllocate($payment);
            }
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($payment->refresh()->load('allocations.invoice'), 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        $this->authorize('view', $payment);

        return response()->json($payment->load(['student', 'receivedBy', 'allocations.invoice']));
    }
}
