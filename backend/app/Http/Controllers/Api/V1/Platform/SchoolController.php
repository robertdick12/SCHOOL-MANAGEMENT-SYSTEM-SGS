<?php

namespace App\Http\Controllers\Api\V1\Platform;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SchoolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->denyUnlessPlatformAdmin($request);

        return response()->json(
            School::query()
                ->withCount('users')
                ->orderByRaw("status = 'pending' desc")
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    public function updateStatus(Request $request, School $school): JsonResponse
    {
        $this->denyUnlessPlatformAdmin($request);

        $data = $request->validate([
            'status' => ['required', Rule::in([School::STATUS_PENDING, School::STATUS_ACTIVE, School::STATUS_SUSPENDED])],
            'status_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $school->update([
            'status' => $data['status'],
            'status_note' => $data['status_note'] ?? null,
            'approved_at' => $data['status'] === School::STATUS_ACTIVE ? now() : $school->approved_at,
        ]);

        return response()->json($school->refresh()->loadCount('users'));
    }

    private function denyUnlessPlatformAdmin(Request $request): void
    {
        abort_unless($request->user()->hasRole('platform_admin'), 403);
    }
}
