<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExamRequest;
use App\Models\Exam;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Exam::class);

        $user = $request->user();
        $query = Exam::query()->with(['subject', 'schoolClass', 'academicTerm']);

        if ($schoolClassId = $request->integer('school_class_id')) {
            $query->where('school_class_id', $schoolClassId);
        }

        if ($user->hasRole('teacher')) {
            $teacherId = $user->teacher?->id;
            $query->whereExists(function (QueryBuilder $sub) use ($teacherId) {
                $sub->selectRaw('1')
                    ->from('teacher_class_subject')
                    ->whereColumn('teacher_class_subject.school_class_id', 'exams.school_class_id')
                    ->whereColumn('teacher_class_subject.subject_id', 'exams.subject_id')
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

        return response()->json($query->orderBy('exam_date')->get());
    }

    public function store(ExamRequest $request): JsonResponse
    {
        $this->authorize('create', [Exam::class, $request->integer('school_class_id'), $request->integer('subject_id')]);

        $exam = Exam::create([...$request->validated(), 'created_by' => $request->user()->id]);

        return response()->json($exam->load(['subject', 'schoolClass']), 201);
    }

    public function show(Exam $exam): JsonResponse
    {
        $this->authorize('view', $exam);

        return response()->json($exam->load(['subject', 'schoolClass', 'academicTerm', 'creator']));
    }

    public function update(ExamRequest $request, Exam $exam): JsonResponse
    {
        $this->authorize('update', $exam);

        $exam->update($request->validated());

        return response()->json($exam->refresh()->load(['subject', 'schoolClass']));
    }

    public function destroy(Exam $exam): JsonResponse
    {
        $this->authorize('delete', $exam);

        $exam->delete();

        return response()->json(status: 204);
    }

    public function publish(Exam $exam): JsonResponse
    {
        $this->authorize('publish', $exam);

        $exam->update(['is_published' => true]);

        return response()->json($exam->refresh());
    }
}
