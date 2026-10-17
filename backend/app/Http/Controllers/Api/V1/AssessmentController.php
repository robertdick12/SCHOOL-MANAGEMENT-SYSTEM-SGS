<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssessmentRequest;
use App\Models\Assessment;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Assessment::class);

        $user = $request->user();
        $query = Assessment::query()->with(['subject', 'schoolClass', 'academicTerm']);

        if ($schoolClassId = $request->integer('school_class_id')) {
            $query->where('school_class_id', $schoolClassId);
        }
        if ($subjectId = $request->integer('subject_id')) {
            $query->where('subject_id', $subjectId);
        }

        if ($user->hasRole('teacher')) {
            $teacherId = $user->teacher?->id;
            $query->whereExists(function (QueryBuilder $sub) use ($teacherId) {
                $sub->selectRaw('1')->from('teacher_class_subject')
                    ->whereColumn('teacher_class_subject.school_class_id', 'assessments.school_class_id')
                    ->whereColumn('teacher_class_subject.subject_id', 'assessments.subject_id')
                    ->where('teacher_class_subject.teacher_id', $teacherId);
            });
        } elseif ($user->hasRole('student')) {
            $query->where('school_class_id', $user->student?->currentEnrolment()?->school_class_id)
                ->where('is_published', true);
        } elseif ($user->hasRole('parent')) {
            $classIds = $user->guardianProfile?->students
                ->map(fn ($s) => $s->currentEnrolment()?->school_class_id)->filter() ?? [];
            $query->whereIn('school_class_id', $classIds)->where('is_published', true);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function store(AssessmentRequest $request): JsonResponse
    {
        $this->authorize('create', [Assessment::class, $request->integer('school_class_id'), $request->integer('subject_id')]);

        $assessment = Assessment::create([...$request->validated(), 'created_by' => $request->user()->id]);

        return response()->json($assessment->load(['subject', 'schoolClass']), 201);
    }

    public function show(Assessment $assessment): JsonResponse
    {
        $this->authorize('view', $assessment);

        return response()->json($assessment->load(['subject', 'schoolClass', 'academicTerm']));
    }

    public function update(AssessmentRequest $request, Assessment $assessment): JsonResponse
    {
        $this->authorize('update', $assessment);

        $assessment->update($request->validated());

        return response()->json($assessment->refresh()->load(['subject', 'schoolClass']));
    }

    public function destroy(Assessment $assessment): JsonResponse
    {
        $this->authorize('delete', $assessment);

        $assessment->delete();

        return response()->json(status: 204);
    }

    public function publish(Assessment $assessment): JsonResponse
    {
        $this->authorize('publish', $assessment);

        $assessment->update(['is_published' => true]);

        return response()->json($assessment->refresh());
    }
}
