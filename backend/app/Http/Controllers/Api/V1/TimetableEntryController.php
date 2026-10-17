<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TimetableEntryRequest;
use App\Models\TimetableEntry;
use App\Services\TimetableConflictService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TimetableEntryController extends Controller
{
    public function __construct(private readonly TimetableConflictService $conflicts)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', TimetableEntry::class);

        $user = $request->user();
        $query = TimetableEntry::query()->with(['schoolClass', 'subject', 'teacher.user']);

        if ($schoolClassId = $request->integer('school_class_id')) {
            $query->where('school_class_id', $schoolClassId);
        } elseif ($user->hasRole('teacher')) {
            $query->where('teacher_id', $user->teacher?->id);
        } elseif ($user->hasRole('student')) {
            $query->where('school_class_id', $user->student?->currentEnrolment()?->school_class_id);
        } elseif ($user->hasRole('parent')) {
            $classIds = $user->guardianProfile?->students
                ->map(fn ($s) => $s->currentEnrolment()?->school_class_id)->filter() ?? [];
            $query->whereIn('school_class_id', $classIds);
        }

        return response()->json(
            $query->orderBy('day_of_week')->orderBy('start_time')->get()
        );
    }

    public function store(TimetableEntryRequest $request): JsonResponse
    {
        $this->authorize('create', TimetableEntry::class);

        $this->assertNoConflicts($request);

        $entry = TimetableEntry::create($request->validated());

        return response()->json($entry->load(['schoolClass', 'subject', 'teacher.user']), 201);
    }

    public function update(TimetableEntryRequest $request, TimetableEntry $timetableEntry): JsonResponse
    {
        $this->authorize('update', $timetableEntry);

        $this->assertNoConflicts($request, $timetableEntry->id);

        $timetableEntry->update($request->validated());

        return response()->json($timetableEntry->refresh()->load(['schoolClass', 'subject', 'teacher.user']));
    }

    public function destroy(TimetableEntry $timetableEntry): JsonResponse
    {
        $this->authorize('delete', $timetableEntry);

        $timetableEntry->delete();

        return response()->json(status: 204);
    }

    private function assertNoConflicts(TimetableEntryRequest $request, ?int $excludingId = null): void
    {
        $conflicts = $this->conflicts->findConflicts(
            schoolClassId: $request->integer('school_class_id'),
            teacherId: $request->integer('teacher_id'),
            dayOfWeek: $request->integer('day_of_week'),
            startTime: $request->input('start_time'),
            endTime: $request->input('end_time'),
            room: $request->input('room'),
            excludingEntryId: $excludingId,
        );

        if ($conflicts !== []) {
            throw ValidationException::withMessages(['start_time' => $conflicts]);
        }
    }
}
