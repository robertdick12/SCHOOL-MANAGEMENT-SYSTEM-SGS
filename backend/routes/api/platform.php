<?php

use App\Http\Controllers\Api\V1\Platform\SchoolController;
use App\Http\Controllers\Api\V1\SchoolRegistrationController;
use Illuminate\Support\Facades\Route;

Route::post('/register-school', [SchoolRegistrationController::class, 'store'])
    ->middleware('throttle:5,1');

Route::middleware(['auth:sanctum', 'school.active'])->prefix('platform')->group(function () {
    Route::get('schools', [SchoolController::class, 'index']);
    Route::patch('schools/{school}', [SchoolController::class, 'updateStatus']);
});
