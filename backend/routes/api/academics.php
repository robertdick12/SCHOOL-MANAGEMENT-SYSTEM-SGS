<?php

use App\Http\Controllers\Api\V1\Admin\AcademicTermController;
use App\Http\Controllers\Api\V1\Admin\AcademicYearController;
use App\Http\Controllers\Api\V1\Admin\SubjectController;
use App\Http\Controllers\Api\V1\SchoolClassController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'school.active'])->group(function () {
    Route::apiResource('academic-years', AcademicYearController::class);
    Route::apiResource('academic-terms', AcademicTermController::class);
    Route::apiResource('subjects', SubjectController::class);
    Route::apiResource('school-classes', SchoolClassController::class);
});
