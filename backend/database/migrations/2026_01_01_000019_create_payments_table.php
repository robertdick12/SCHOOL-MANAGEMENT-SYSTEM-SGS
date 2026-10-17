<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('amount_pesewas');
            $table->string('method'); // cash | mobile_money | bank_transfer | cheque
            $table->string('provider')->nullable(); // paystack | hubtel | manual
            // Unique provider reference prevents the same provider transaction being recorded twice.
            $table->string('provider_reference')->nullable()->unique();
            $table->string('status')->default('pending'); // pending | verified | failed
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('paid_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
