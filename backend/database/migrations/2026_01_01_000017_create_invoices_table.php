<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_term_id')->constrained()->cascadeOnDelete();
            // Denormalized total, always recalculated from invoice_items inside a transaction.
            $table->unsignedBigInteger('total_amount_pesewas')->default(0);
            $table->unsignedBigInteger('amount_paid_pesewas')->default(0);
            $table->string('status')->default('unpaid'); // unpaid | partial | paid | cancelled
            $table->date('due_date')->nullable();
            $table->timestamp('issued_at')->useCurrent();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['student_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
