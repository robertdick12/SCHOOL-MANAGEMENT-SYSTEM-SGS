<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitAttendanceRequest;
use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Roster for taking/reviewing a class's register on a given date.
     */
    public function forClassAndDate(Request $request): JsonResponse
    {
        $schoolClass = SchoolClass::findOrFail($request->integer('school_class_id'));
        $this->authorize('view', $schoolClass);

        $date = $request->date('date') ?? today();

        $students = Student::query()
            ->whereHas('enrolments', fn ($q) => $q->where('school_class_id', $schoolClass->id))
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'admission_number']);

        $marked = Attendance::query()
            ->where('school_class_id', $schoolClass->id)
            ->whereDate('date', $date)
            ->get()
            ->keyBy('student_id');

        $roster = $students->map(function (Student $student) use ($marked) {
            $attendance = $marked->get($student->id);

            return [
                'student_id' => $student->id,
                'name' => $student->fullName(),
                'admission_number' => $student->admission_number,
                'status' => $attendance?->status,
                'remarks' => $attendance?->remarks,
            ];
        });

        return response()->json(['date' => $date->toDateString(), 'roster' => $roster]);
    }

    public function submit(SubmitAttendanceRequest $request): JsonResponse
    {
        $this->authorize('create', Attendance::class);

        $schoolClassId = $request->integer('school_class_id');
        $date = $request->date('date');

        DB::transaction(function () use ($request, $schoolClassId, $date) {
            foreach ($request->input('records') as $row) {
                Attendance::updateOrCreate(
                    ['student_id' => $row['student_id'], 'date' => $date],
                    [
                        'school_class_id' => $schoolClassId,
                        'status' => $row['status'],
                        'remarks' => $row['remarks'] ?? null,
                        'recorded_by' => $request->user()->id,
                    ],
                );
            }
        });

        return response()->json(['message' => 'Attendance saved.']);
    }

    public function mine(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        return response()->json($this->historyFor($student));
    }

    public function forStudent(Student $student): JsonResponse
    {
        $this->authorize('view', $student);

        return response()->json($this->historyFor($student));
    }

    private function historyFor(Student $student): \Illuminate\Support\Collection
    {
        return $student->attendances()->orderByDesc('date')->limit(90)->get(['date', 'status', 'remarks']);
    }
}
