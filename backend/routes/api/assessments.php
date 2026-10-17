<?php

use App\Http\Controllers\Api\V1\AssessmentController;
use App\Http\Controllers\Api\V1\AssessmentResultController;
use App\Http\Controllers\Api\V1\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'school.active'])->group(function () {
    Route::apiResource('assessments', AssessmentController::class);
    Route::post('assessments/{assessment}/publish', [AssessmentController::class, 'publish']);
    Route::get('assessments/{assessment}/results', [AssessmentResultController::class, 'forAssessment']);
    Route::post('assessments/{assessment}/results', [AssessmentResultController::class, 'submit']);

    Route::get('results/mine', [AssessmentResultController::class, 'mine']);
    Route::get('students/{student}/results', [AssessmentResultController::class, 'forStudent']);

    Route::get('attendance', [AttendanceController::class, 'forClassAndDate']);
    Route::post('attendance', [AttendanceController::class, 'submit']);
    Route::get('attendance/mine', [AttendanceController::class, 'mine']);
    Route::get('students/{student}/attendance', [AttendanceController::class, 'forStudent']);
});
