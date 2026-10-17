<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeacherAssignmentRequest;
use App\Models\TeacherClassSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TeacherAssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', TeacherClassSubject::class);

        $query = TeacherClassSubject::query()->with(['teacher.user', 'schoolClass', 'subject', 'academicTerm']);

        if ($schoolClassId = $request->integer('school_class_id')) {
            $query->where('school_class_id', $schoolClassId);
        }

        return response()->json($query->get());
    }

    public function store(TeacherAssignmentRequest $request): JsonResponse
    {
        $this->authorize('create', TeacherClassSubject::class);

        $exists = TeacherClassSubject::query()
            ->where('school_class_id', $request->input('school_class_id'))
            ->where('subject_id', $request->input('subject_id'))
            ->where('academic_term_id', $request->input('academic_term_id'))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'subject_id' => ['This class already has a teacher assigned for this subject and term.'],
            ]);
        }

        $assignment = TeacherClassSubject::create($request->validated());

        return response()->json($assignment->load(['teacher.user', 'schoolClass', 'subject']), 201);
    }

    public function destroy(TeacherClassSubject $teacherAssignment): JsonResponse
    {
        $this->authorize('delete', $teacherAssignment);

        $teacherAssignment->delete();

        return response()->json(status: 204);
    }
}
