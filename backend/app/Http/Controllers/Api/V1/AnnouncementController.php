<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnnouncementRequest;
use App\Models\Announcement;
use App\Models\User;
use App\Notifications\AnnouncementPublished;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Announcement::class);

        $user = $request->user();
        $query = Announcement::query()->with('creator');

        if (! $user->hasRole('admin')) {
            $classId = match (true) {
                $user->hasRole('student') => $user->student?->currentEnrolment()?->school_class_id,
                $user->hasRole('teacher') => null,
                default => null,
            };

            $query->where(function ($q) use ($user, $classId) {
                $q->where('created_by', $user->id)
                    ->orWhere(function ($q2) use ($user, $classId) {
                        $q2->whereNotNull('published_at')
                            ->where('published_at', '<=', now())
                            ->where(function ($q3) use ($user) {
                                $q3->where('audience', 'all');
                                foreach ($user->getRoleNames() as $role) {
                                    $q3->orWhere('audience', $role);
                                }
                            })
                            ->where(function ($q4) use ($classId) {
                                $q4->whereNull('school_class_id');
                                if ($classId) {
                                    $q4->orWhere('school_class_id', $classId);
                                }
                            });
                    });
            });
        }

        return response()->json($query->orderByDesc('published_at')->paginate($request->integer('per_page', 25)));
    }

    public function store(AnnouncementRequest $request): JsonResponse
    {
        $this->authorize('create', Announcement::class);

        $announcement = Announcement::create([...$request->validated(), 'created_by' => $request->user()->id]);

        if ($announcement->isPublished()) {
            $this->notifyAudience($announcement);
        }

        return response()->json($announcement, 201);
    }

    /**
     * Role-based only — doesn't narrow by the announcement's optional
     * school_class_id, unlike the in-app list in index(). A known
     * simplification: the emailed "heads up" is slightly broader than who
     * ends up seeing it scoped correctly in the app itself.
     */
    private function notifyAudience(Announcement $announcement): void
    {
        $query = User::query()->where('is_active', true)->where('id', '!=', $announcement->created_by);

        if ($announcement->audience !== 'all') {
            $query->role($announcement->audience);
        }

        $recipients = $query->get();

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new AnnouncementPublished($announcement));
        }
    }

    public function show(Announcement $announcement): JsonResponse
    {
        $this->authorize('view', $announcement);

        return response()->json($announcement->load('creator'));
    }

    public function update(AnnouncementRequest $request, Announcement $announcement): JsonResponse
    {
        $this->authorize('update', $announcement);

        $announcement->update($request->validated());

        return response()->json($announcement->refresh());
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $this->authorize('delete', $announcement);

        $announcement->delete();

        return response()->json(status: 204);
    }
}
