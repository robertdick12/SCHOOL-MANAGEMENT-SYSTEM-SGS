<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\FeeStructureRequest;
use App\Models\FeeStructure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeeStructureController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', FeeStructure::class);

        $query = FeeStructure::query()->with(['schoolClass', 'academicTerm']);

        if ($termId = $request->integer('academic_term_id')) {
            $query->where('academic_term_id', $termId);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function store(FeeStructureRequest $request): JsonResponse
    {
        $this->authorize('create', FeeStructure::class);

        return response()->json(FeeStructure::create($request->validated())->load('schoolClass'), 201);
    }

    public function update(FeeStructureRequest $request, FeeStructure $feeStructure): JsonResponse
    {
        $this->authorize('update', $feeStructure);

        $feeStructure->update($request->validated());

        return response()->json($feeStructure->refresh());
    }

    public function destroy(FeeStructure $feeStructure): JsonResponse
    {
        $this->authorize('delete', $feeStructure);

        $feeStructure->delete();

        return response()->json(status: 204);
    }
}
