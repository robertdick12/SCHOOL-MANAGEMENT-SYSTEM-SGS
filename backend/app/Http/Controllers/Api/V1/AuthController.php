<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, remember: false)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $user = $request->user();

        if (! $user->is_active) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated. Contact the school administrator.'],
            ]);
        }

        if ($user->school_id !== null && $user->school?->status !== School::STATUS_ACTIVE) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => [match ($user->school?->status) {
                    School::STATUS_SUSPENDED => "Your school's subscription is not active. Contact support to renew access.",
                    default => "Your school's registration is pending approval. We'll notify you once it's active.",
                }],
            ]);
        }

        $request->session()->regenerate();

        return response()->json(['message' => 'Logged in.']);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('school');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->values(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values(),
            'school' => $user->school ? [
                'id' => $user->school->id,
                'name' => $user->school->name,
                'status' => $user->school->status,
            ] : null,
        ]);
    }
}
