<?php

use App\Http\Controllers\Api\V1\Admin\GuardianController;
use App\Http\Controllers\Api\V1\Admin\StudentController;
use App\Http\Controllers\Api\V1\Admin\StudentEnrolmentController;
use App\Http\Controllers\Api\V1\Admin\TeacherAssignmentController;
use App\Http\Controllers\Api\V1\Admin\TeacherController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('teachers', TeacherController::class);

    Route::get('students/export', [StudentController::class, 'export']);
    Route::post('students/import', [StudentController::class, 'import']);
    Route::apiResource('students', StudentController::class);
    Route::post('students/{student}/provision-login', [StudentController::class, 'provisionLogin']);

    Route::apiResource('guardians', GuardianController::class);
    Route::post('guardians/{guardian}/provision-login', [GuardianController::class, 'provisionLogin']);
    Route::post('guardians/{guardian}/students', [GuardianController::class, 'linkStudent']);
    Route::delete('guardians/{guardian}/students/{student}', [GuardianController::class, 'unlinkStudent']);

    Route::post('enrolments', [StudentEnrolmentController::class, 'store']);
    Route::delete('enrolments/{studentEnrolment}', [StudentEnrolmentController::class, 'destroy']);

    Route::get('teacher-assignments', [TeacherAssignmentController::class, 'index']);
    Route::post('teacher-assignments', [TeacherAssignmentController::class, 'store']);
    Route::delete('teacher-assignments/{teacherAssignment}', [TeacherAssignmentController::class, 'destroy']);
});
