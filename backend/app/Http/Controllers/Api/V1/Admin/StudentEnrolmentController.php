<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StudentEnrolmentRequest;
use App\Models\StudentEnrolment;
use Illuminate\Http\JsonResponse;

class StudentEnrolmentController extends Controller
{
    public function store(StudentEnrolmentRequest $request): JsonResponse
    {
        $this->authorize('create', StudentEnrolment::class);

        // A student has one class per academic year — re-enrolling (e.g. a
        // mid-year class transfer) updates that year's existing row instead
        // of violating the unique constraint.
        $enrolment = StudentEnrolment::updateOrCreate(
            [
                'student_id' => $request->input('student_id'),
                'academic_year_id' => $request->input('academic_year_id'),
            ],
            [
                'school_class_id' => $request->input('school_class_id'),
                'enrolled_at' => $request->input('enrolled_at'),
                'status' => $request->input('status', 'active'),
            ],
        );

        return response()->json($enrolment->load('schoolClass'), 201);
    }

    public function destroy(StudentEnrolment $studentEnrolment): JsonResponse
    {
        $this->authorize('delete', $studentEnrolment);

        $studentEnrolment->delete();

        return response()->json(status: 204);
    }
}
