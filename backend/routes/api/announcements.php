<?php

use App\Http\Controllers\Api\V1\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'school.active'])->group(function () {
    Route::apiResource('announcements', AnnouncementController::class);
});
