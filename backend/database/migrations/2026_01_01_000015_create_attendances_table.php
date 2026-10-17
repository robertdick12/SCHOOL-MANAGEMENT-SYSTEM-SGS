<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('status'); // present | absent | late | excused
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('remarks')->nullable();
            $table->timestamps();

            // One attendance record per student per day.
            $table->unique(['student_id', 'date']);
            $table->index(['school_class_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
