<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeacherRequest;
use App\Models\Teacher;
use App\Services\UserProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    public function __construct(private readonly UserProvisioningService $provisioning)
    {
    }

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Teacher::class);

        return response()->json(
            Teacher::query()->with('user')->orderBy('staff_number')->get()
        );
    }

    public function store(TeacherRequest $request): JsonResponse
    {
        $this->authorize('create', Teacher::class);

        $result = DB::transaction(function () use ($request) {
            $provisioned = $this->provisioning->createForRole(
                $request->string('name')->toString(),
                $request->string('email')->toString(),
                'teacher',
            );

            $teacher = Teacher::create([
                'user_id' => $provisioned['user']->id,
                'staff_number' => $request->input('staff_number'),
                'qualification' => $request->input('qualification'),
                'hire_date' => $request->input('hire_date'),
                'status' => $request->input('status', 'active'),
            ]);

            return [$teacher, $provisioned['temporary_password']];
        });

        [$teacher, $temporaryPassword] = $result;

        return response()->json([
            ...$teacher->load('user')->toArray(),
            'temporary_password' => $temporaryPassword,
        ], 201);
    }

    public function show(Teacher $teacher): JsonResponse
    {
        $this->authorize('view', $teacher);

        return response()->json($teacher->load(['user', 'classAssignments.schoolClass', 'classAssignments.subject']));
    }

    public function update(TeacherRequest $request, Teacher $teacher): JsonResponse
    {
        $this->authorize('update', $teacher);

        DB::transaction(function () use ($request, $teacher) {
            $teacher->user->update([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
            ]);

            $teacher->update([
                'staff_number' => $request->input('staff_number'),
                'qualification' => $request->input('qualification'),
                'hire_date' => $request->input('hire_date'),
                'status' => $request->input('status', $teacher->status),
            ]);
        });

        return response()->json($teacher->refresh()->load('user'));
    }

    public function destroy(Teacher $teacher): JsonResponse
    {
        $this->authorize('delete', $teacher);

        $teacher->delete();

        return response()->json(status: 204);
    }
}
