<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', AuditLog::class);

        $query = AuditLog::query()->with('user');

        if ($type = $request->string('auditable_type')->toString()) {
            $query->where('auditable_type', $type);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate($request->integer('per_page', 50))
        );
    }
}
