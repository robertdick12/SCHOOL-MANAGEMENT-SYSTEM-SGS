<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubjectRequest;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;

class SubjectController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Subject::class);

        return response()->json(Subject::query()->orderBy('name')->get());
    }

    public function store(SubjectRequest $request): JsonResponse
    {
        $this->authorize('create', Subject::class);

        return response()->json(Subject::create($request->validated()), 201);
    }

    public function show(Subject $subject): JsonResponse
    {
        $this->authorize('view', $subject);

        return response()->json($subject);
    }

    public function update(SubjectRequest $request, Subject $subject): JsonResponse
    {
        $this->authorize('update', $subject);

        $subject->update($request->validated());

        return response()->json($subject);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $this->authorize('delete', $subject);

        $subject->delete();

        return response()->json(status: 204);
    }
}
