<?php

use App\Http\Controllers\Api\V1\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('dashboard')->group(function () {
    Route::get('admin', [DashboardController::class, 'admin']);
    Route::get('teacher', [DashboardController::class, 'teacher']);
    Route::get('student', [DashboardController::class, 'student']);
    Route::get('parent', [DashboardController::class, 'parent']);
    Route::get('accountant', [DashboardController::class, 'accountant']);
});
