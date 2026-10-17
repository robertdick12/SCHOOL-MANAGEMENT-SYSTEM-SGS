<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AcademicYearRequest;
use App\Models\AcademicYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', AcademicYear::class);

        return response()->json(
            AcademicYear::query()->orderByDesc('start_date')->get()
        );
    }

    public function store(AcademicYearRequest $request): JsonResponse
    {
        $this->authorize('create', AcademicYear::class);

        $year = DB::transaction(function () use ($request) {
            if ($request->boolean('is_current')) {
                AcademicYear::query()->update(['is_current' => false]);
            }

            return AcademicYear::create($request->validated());
        });

        return response()->json($year, 201);
    }

    public function show(AcademicYear $academicYear): JsonResponse
    {
        $this->authorize('view', $academicYear);

        return response()->json($academicYear->load('terms'));
    }

    public function update(AcademicYearRequest $request, AcademicYear $academicYear): JsonResponse
    {
        $this->authorize('update', $academicYear);

        DB::transaction(function () use ($request, $academicYear) {
            if ($request->boolean('is_current')) {
                AcademicYear::query()->where('id', '!=', $academicYear->id)->update(['is_current' => false]);
            }

            $academicYear->update($request->validated());
        });

        return response()->json($academicYear->refresh());
    }

    public function destroy(AcademicYear $academicYear): JsonResponse
    {
        $this->authorize('delete', $academicYear);

        $academicYear->delete();

        return response()->json(status: 204);
    }
}
