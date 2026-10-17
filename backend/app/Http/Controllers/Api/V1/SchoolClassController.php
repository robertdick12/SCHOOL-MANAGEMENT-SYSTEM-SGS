<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SchoolClassRequest;
use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', SchoolClass::class);

        $user = $request->user();
        $query = SchoolClass::query()->with(['academicYear', 'classTeacher.user']);

        if ($user->hasRole('teacher')) {
            $teacherId = $user->teacher?->id;
            $query->where(function ($q) use ($teacherId) {
                $q->where('class_teacher_id', $teacherId)
                    ->orWhereHas('teacherAssignments', fn ($a) => $a->where('teacher_id', $teacherId));
            });
        } elseif ($user->hasRole('student')) {
            $classId = $user->student?->currentEnrolment()?->school_class_id;
            $query->whereKey($classId);
        } elseif ($user->hasRole('parent')) {
            $classIds = $user->guardianProfile?->students
                ->map(fn ($s) => $s->currentEnrolment()?->school_class_id)
                ->filter()
                ->values() ?? [];
            $query->whereIn('id', $classIds);
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(SchoolClassRequest $request): JsonResponse
    {
        $this->authorize('create', SchoolClass::class);

        return response()->json(SchoolClass::create($request->validated())->load('academicYear'), 201);
    }

    public function show(SchoolClass $schoolClass): JsonResponse
    {
        $this->authorize('view', $schoolClass);

        return response()->json($schoolClass->load(['academicYear', 'classTeacher.user']));
    }

    public function update(SchoolClassRequest $request, SchoolClass $schoolClass): JsonResponse
    {
        $this->authorize('update', $schoolClass);

        $schoolClass->update($request->validated());

        return response()->json($schoolClass->refresh()->load('academicYear'));
    }

    public function destroy(SchoolClass $schoolClass): JsonResponse
    {
        $this->authorize('delete', $schoolClass);

        $schoolClass->delete();

        return response()->json(status: 204);
    }
}
