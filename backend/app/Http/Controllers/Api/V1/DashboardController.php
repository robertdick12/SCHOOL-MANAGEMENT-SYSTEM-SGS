<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicTerm;
use App\Models\Announcement;
use App\Models\Assessment;
use App\Models\Attendance;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\TimetableEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function admin(): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        $outstanding = Invoice::query()->whereIn('status', ['unpaid', 'partial'])
            ->selectRaw('COALESCE(SUM(total_amount_pesewas - amount_paid_pesewas), 0) as total')
            ->value('total');

        $todayCollections = Payment::query()->whereDate('paid_at', today())->sum('amount_pesewas');

        return response()->json([
            'student_count' => Student::query()->where('status', 'active')->count(),
            'teacher_count' => Teacher::query()->where('status', 'active')->count(),
            'class_count' => SchoolClass::query()->count(),
            'outstanding_balance_pesewas' => (int) $outstanding,
            'todays_collections_pesewas' => (int) $todayCollections,
            'unpublished_assessments' => Assessment::query()->where('is_published', false)->count(),
        ]);
    }

    public function teacher(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;

        if (! $teacher) {
            return response()->json(['message' => 'No teacher profile linked to this account.'], 404);
        }

        $todayDow = (int) now()->isoWeekday();

        return response()->json([
            'class_count' => $teacher->classAssignments()->distinct('school_class_id')->count('school_class_id'),
            'todays_lessons' => TimetableEntry::query()
                ->where('teacher_id', $teacher->id)
                ->where('day_of_week', $todayDow)
                ->with(['schoolClass', 'subject'])
                ->orderBy('start_time')
                ->get(),
            'unpublished_assessments' => Assessment::query()
                ->whereHas('schoolClass.teacherAssignments', fn ($q) => $q->where('teacher_id', $teacher->id))
                ->where('is_published', false)
                ->count(),
        ]);
    }

    public function student(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        $term = AcademicTerm::current();
        $attendanceQuery = $student->attendances();
        if ($term) {
            $attendanceQuery->whereBetween('date', [$term->start_date, $term->end_date]);
        }
        $totalDays = $attendanceQuery->count();
        $presentDays = (clone $attendanceQuery)->whereIn('status', ['present', 'late'])->count();

        return response()->json([
            'current_class' => $student->currentEnrolment()?->schoolClass?->name,
            'attendance_rate' => $totalDays > 0 ? round($presentDays / $totalDays * 100, 1) : null,
            'published_results_count' => $student->assessmentResults()
                ->whereHas('assessment', fn ($q) => $q->where('is_published', true))->count(),
        ]);
    }

    public function parent(Request $request): JsonResponse
    {
        $guardian = $request->user()->guardianProfile;

        if (! $guardian) {
            return response()->json(['message' => 'No guardian profile linked to this account.'], 404);
        }

        $children = $guardian->students->map(function ($student) {
            $outstanding = Invoice::query()
                ->where('student_id', $student->id)
                ->whereIn('status', ['unpaid', 'partial'])
                ->selectRaw('COALESCE(SUM(total_amount_pesewas - amount_paid_pesewas), 0) as total')
                ->value('total');

            return [
                'student_id' => $student->id,
                'name' => $student->fullName(),
                'class' => $student->currentEnrolment()?->schoolClass?->name,
                'outstanding_balance_pesewas' => (int) $outstanding,
            ];
        });

        return response()->json(['children' => $children]);
    }

    public function accountant(): JsonResponse
    {
        $this->authorize('viewAny', Invoice::class);

        $outstanding = Invoice::query()->whereIn('status', ['unpaid', 'partial'])
            ->selectRaw('COALESCE(SUM(total_amount_pesewas - amount_paid_pesewas), 0) as total')
            ->value('total');

        return response()->json([
            'outstanding_balance_pesewas' => (int) $outstanding,
            'todays_collections_pesewas' => (int) Payment::query()->whereDate('paid_at', today())->sum('amount_pesewas'),
            'unpaid_invoice_count' => Invoice::query()->whereIn('status', ['unpaid', 'partial'])->count(),
            'recent_payments' => Payment::query()->with('student')->orderByDesc('paid_at')->limit(10)->get(),
        ]);
    }
}
