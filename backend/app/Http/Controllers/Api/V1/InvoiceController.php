<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateInvoiceRequest;
use App\Models\AcademicTerm;
use App\Models\Invoice;
use App\Models\Student;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoices)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Invoice::class);

        $user = $request->user();
        $query = Invoice::query()->with(['student', 'academicTerm', 'items']);

        if ($user->hasRole('student')) {
            $query->where('student_id', $user->student?->id);
        } elseif ($user->hasRole('parent')) {
            $studentIds = $user->guardianProfile?->students->pluck('id') ?? [];
            $query->whereIn('student_id', $studentIds);
        } elseif ($studentId = $request->integer('student_id')) {
            $query->where('student_id', $studentId);
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        return response()->json($query->orderByDesc('issued_at')->paginate($request->integer('per_page', 25)));
    }

    public function generate(GenerateInvoiceRequest $request): JsonResponse
    {
        $this->authorize('create', Invoice::class);

        $student = Student::findOrFail($request->input('student_id'));
        $term = AcademicTerm::findOrFail($request->input('academic_term_id'));

        try {
            $invoice = $this->invoices->generateForStudent($student, $term, $request->user());
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json($invoice->load('items'), 201);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $this->authorize('view', $invoice);

        return response()->json($invoice->load(['student', 'academicTerm', 'items', 'allocations.payment']));
    }

    public function cancel(Invoice $invoice): JsonResponse
    {
        $this->authorize('cancel', $invoice);

        if ($invoice->amount_paid_pesewas > 0) {
            return response()->json(['message' => 'Cannot cancel an invoice that already has payments allocated to it.'], 422);
        }

        $invoice->update(['status' => 'cancelled']);

        return response()->json($invoice->refresh());
    }
}
