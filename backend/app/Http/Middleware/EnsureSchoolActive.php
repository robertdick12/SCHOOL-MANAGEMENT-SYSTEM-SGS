<?php

namespace App\Http\Middleware;

use App\Models\School;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cuts access immediately when a school's subscription is pending/suspended,
 * not just at next login — so a platform-admin suspension takes effect on a
 * user's very next request, not only after their session expires.
 */
class EnsureSchoolActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->school_id !== null && $user->school?->status !== School::STATUS_ACTIVE) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();

            abort(403, "Your school's access is not currently active. Contact support.");
        }

        return $next($request);
    }
}
