<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitAssessmentResultsRequest;
use App\Models\Assessment;
use App\Models\AssessmentResult;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssessmentResultController extends Controller
{
    /**
     * Roster for entering/viewing scores: every student currently enrolled
     * in the assessment's class, with their existing result if one exists.
     */
    public function forAssessment(Assessment $assessment): JsonResponse
    {
        $this->authorize('view', $assessment);

        $students = Student::query()
            ->whereHas('enrolments', fn ($q) => $q->where('school_class_id', $assessment->school_class_id))
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'admission_number']);

        $results = $assessment->results()->get()->keyBy('student_id');

        $roster = $students->map(function (Student $student) use ($results) {
            $result = $results->get($student->id);

            return [
                'student_id' => $student->id,
                'name' => $student->fullName(),
                'admission_number' => $student->admission_number,
                'result_id' => $result?->id,
                'score' => $result?->score,
                'remarks' => $result?->remarks,
            ];
        });

        return response()->json([
            'assessment' => $assessment,
            'roster' => $roster,
        ]);
    }

    public function submit(SubmitAssessmentResultsRequest $request, Assessment $assessment): JsonResponse
    {
        $this->authorize('enterResults', $assessment);

        DB::transaction(function () use ($request, $assessment) {
            foreach ($request->input('results') as $row) {
                AssessmentResult::updateOrCreate(
                    ['assessment_id' => $assessment->id, 'student_id' => $row['student_id']],
                    [
                        'score' => $row['score'] ?? null,
                        'remarks' => $row['remarks'] ?? null,
                        'recorded_by' => $request->user()->id,
                    ],
                );
            }
        });

        return response()->json(['message' => 'Results saved.']);
    }

    /**
     * The authenticated student's own published results.
     */
    public function mine(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        return response()->json($this->publishedResultsFor($student));
    }

    /**
     * A specific student's published results — for a parent's linked child,
     * or an admin/teacher reviewing a report.
     */
    public function forStudent(Student $student): JsonResponse
    {
        $this->authorize('view', $student);

        return response()->json($this->publishedResultsFor($student));
    }

    private function publishedResultsFor(Student $student): \Illuminate\Support\Collection
    {
        return $student->assessmentResults()
            ->whereHas('assessment', fn ($q) => $q->where('is_published', true))
            ->with('assessment.subject')
            ->get()
            ->map(fn (AssessmentResult $result) => [
                'id' => $result->id,
                'assessment' => $result->assessment->name,
                'type' => $result->assessment->type,
                'subject' => $result->assessment->subject->name,
                'score' => $result->score,
                'max_score' => $result->assessment->max_score,
                'remarks' => $result->remarks,
            ]);
    }
}
