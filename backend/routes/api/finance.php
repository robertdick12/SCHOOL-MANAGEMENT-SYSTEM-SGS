<?php

use App\Http\Controllers\Api\V1\FeeStructureController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('fee-structures', FeeStructureController::class)->except(['show']);

    Route::get('invoices', [InvoiceController::class, 'index']);
    Route::post('invoices/generate', [InvoiceController::class, 'generate']);
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::post('invoices/{invoice}/cancel', [InvoiceController::class, 'cancel']);

    Route::get('payments', [PaymentController::class, 'index']);
    Route::post('payments', [PaymentController::class, 'store']);
    Route::get('payments/{payment}', [PaymentController::class, 'show']);
});
