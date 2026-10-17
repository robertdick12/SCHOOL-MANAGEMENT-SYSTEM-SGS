<?php

use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('audit-logs', [AuditLogController::class, 'index']);

    Route::get('users', [UserController::class, 'index']);
    Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive']);
});
