<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProvisionLoginRequest;
use App\Http\Requests\StudentRequest;
use App\Models\Student;
use App\Services\UserProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function __construct(private readonly UserProvisioningService $provisioning)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::query()->with(['user', 'enrolments.schoolClass']);

        $user = $request->user();
        if ($user->hasRole('teacher')) {
            $teacherId = $user->teacher?->id;
            $query->whereHas(
                'enrolments.schoolClass.teacherAssignments',
                fn ($a) => $a->where('teacher_id', $teacherId)
            );
        }

        if ($schoolClassId = $request->integer('school_class_id')) {
            $query->whereHas('enrolments', fn ($q) => $q->where('school_class_id', $schoolClassId));
        }

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('admission_number', 'ilike', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('last_name')->paginate($request->integer('per_page', 25))
        );
    }

    public function store(StudentRequest $request): JsonResponse
    {
        $this->authorize('create', Student::class);

        $student = Student::create($request->validated());

        return response()->json($student, 201);
    }

    public function show(Student $student): JsonResponse
    {
        $this->authorize('view', $student);

        return response()->json(
            $student->load(['user', 'enrolments.schoolClass', 'guardians'])
        );
    }

    public function update(StudentRequest $request, Student $student): JsonResponse
    {
        $this->authorize('update', $student);

        $student->update($request->validated());

        return response()->json($student->refresh());
    }

    public function destroy(Student $student): JsonResponse
    {
        $this->authorize('delete', $student);

        $student->delete();

        return response()->json(status: 204);
    }

    public function provisionLogin(ProvisionLoginRequest $request, Student $student): JsonResponse
    {
        $this->authorize('update', $student);

        if ($student->user_id) {
            return response()->json(['message' => 'This student already has a portal account.'], 422);
        }

        $provisioned = $this->provisioning->createForRole(
            $student->fullName(),
            $request->string('email')->toString(),
            'student',
        );

        $student->update(['user_id' => $provisioned['user']->id]);

        return response()->json([
            'user' => $provisioned['user'],
            'temporary_password' => $provisioned['temporary_password'],
        ], 201);
    }
}
