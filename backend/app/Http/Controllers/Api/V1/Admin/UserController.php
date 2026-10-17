<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->denyUnlessAdmin($request);

        return response()->json(
            User::query()->with('roles')->orderBy('name')->paginate($request->integer('per_page', 25))
        );
    }

    public function toggleActive(Request $request, User $user): JsonResponse
    {
        $this->denyUnlessAdmin($request);

        if ($user->id === $request->user()->id) {
            throw ValidationException::withMessages(['user' => ['You cannot deactivate your own account.']]);
        }

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json($user->refresh());
    }

    private function denyUnlessAdmin(Request $request): void
    {
        abort_unless($request->user()->hasRole('admin'), 403);
    }
}
