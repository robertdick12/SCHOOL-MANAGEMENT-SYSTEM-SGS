<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AcademicTermRequest;
use App\Models\AcademicTerm;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AcademicTermController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', AcademicTerm::class);

        return response()->json(
            AcademicTerm::query()->with('academicYear')->orderByDesc('start_date')->get()
        );
    }

    public function store(AcademicTermRequest $request): JsonResponse
    {
        $this->authorize('create', AcademicTerm::class);

        $term = DB::transaction(function () use ($request) {
            if ($request->boolean('is_current')) {
                AcademicTerm::query()->update(['is_current' => false]);
            }

            return AcademicTerm::create($request->validated());
        });

        return response()->json($term, 201);
    }

    public function show(AcademicTerm $academicTerm): JsonResponse
    {
        $this->authorize('view', $academicTerm);

        return response()->json($academicTerm->load('academicYear'));
    }

    public function update(AcademicTermRequest $request, AcademicTerm $academicTerm): JsonResponse
    {
        $this->authorize('update', $academicTerm);

        DB::transaction(function () use ($request, $academicTerm) {
            if ($request->boolean('is_current')) {
                AcademicTerm::query()->where('id', '!=', $academicTerm->id)->update(['is_current' => false]);
            }

            $academicTerm->update($request->validated());
        });

        return response()->json($academicTerm->refresh());
    }

    public function destroy(AcademicTerm $academicTerm): JsonResponse
    {
        $this->authorize('delete', $academicTerm);

        $academicTerm->delete();

        return response()->json(status: 204);
    }
}
