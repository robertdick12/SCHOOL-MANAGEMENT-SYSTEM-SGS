<?php

use App\Http\Controllers\Api\V1\ExamController;
use App\Http\Controllers\Api\V1\TimetableEntryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('timetable-entries', TimetableEntryController::class)->except(['show']);

    Route::apiResource('exams', ExamController::class);
    Route::post('exams/{exam}/publish', [ExamController::class, 'publish']);
});
