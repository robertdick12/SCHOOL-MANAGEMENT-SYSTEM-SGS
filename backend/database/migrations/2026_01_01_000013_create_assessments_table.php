<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Mid-term Exam", "Quiz 1"
            $table->string('type')->default('exam'); // exam | quiz | homework | project | other
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_term_id')->constrained()->cascadeOnDelete();
            $table->decimal('max_score', 6, 2)->default(100);
            $table->decimal('weight', 5, 2)->nullable(); // % weight toward final grade
            $table->boolean('is_published')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['school_class_id', 'subject_id', 'academic_term_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
