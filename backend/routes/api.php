<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    require __DIR__.'/api/auth.php';
    require __DIR__.'/api/academics.php';
    require __DIR__.'/api/people.php';
    require __DIR__.'/api/scheduling.php';
    require __DIR__.'/api/assessments.php';
    require __DIR__.'/api/finance.php';
    require __DIR__.'/api/announcements.php';
    require __DIR__.'/api/dashboard.php';
    require __DIR__.'/api/admin.php';
    require __DIR__.'/api/platform.php';
});
