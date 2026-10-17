<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuardianRequest;
use App\Http\Requests\LinkGuardianRequest;
use App\Http\Requests\ProvisionLoginRequest;
use App\Models\Guardian;
use App\Models\Student;
use App\Services\UserProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuardianController extends Controller
{
    public function __construct(private readonly UserProvisioningService $provisioning)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Guardian::class);

        $query = Guardian::query()->with('user');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('last_name')->paginate($request->integer('per_page', 25)));
    }

    public function store(GuardianRequest $request): JsonResponse
    {
        $this->authorize('create', Guardian::class);

        return response()->json(Guardian::create($request->validated()), 201);
    }

    public function show(Guardian $guardian): JsonResponse
    {
        $this->authorize('view', $guardian);

        return response()->json($guardian->load(['user', 'students']));
    }

    public function update(GuardianRequest $request, Guardian $guardian): JsonResponse
    {
        $this->authorize('update', $guardian);

        $guardian->update($request->validated());

        return response()->json($guardian->refresh());
    }

    public function destroy(Guardian $guardian): JsonResponse
    {
        $this->authorize('delete', $guardian);

        $guardian->delete();

        return response()->json(status: 204);
    }

    public function linkStudent(LinkGuardianRequest $request, Guardian $guardian): JsonResponse
    {
        $this->authorize('linkStudents', $guardian);

        $student = Student::findOrFail($request->input('student_id'));

        $guardian->students()->syncWithoutDetaching([
            $student->id => [
                'relationship' => $request->input('relationship'),
                'is_primary_contact' => $request->boolean('is_primary_contact'),
            ],
        ]);

        return response()->json($guardian->load('students'));
    }

    public function unlinkStudent(Guardian $guardian, Student $student): JsonResponse
    {
        $this->authorize('linkStudents', $guardian);

        $guardian->students()->detach($student->id);

        return response()->json(status: 204);
    }

    public function provisionLogin(ProvisionLoginRequest $request, Guardian $guardian): JsonResponse
    {
        $this->authorize('update', $guardian);

        if ($guardian->user_id) {
            return response()->json(['message' => 'This guardian already has a portal account.'], 422);
        }

        $provisioned = $this->provisioning->createForRole(
            $guardian->fullName(),
            $request->string('email')->toString(),
            'parent',
        );

        $guardian->update(['user_id' => $provisioned['user']->id]);

        return response()->json([
            'user' => $provisioned['user'],
            'temporary_password' => $provisioned['temporary_password'],
        ], 201);
    }
}
