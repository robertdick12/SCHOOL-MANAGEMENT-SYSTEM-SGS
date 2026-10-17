<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "JHS 1A"
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->unsignedInteger('capacity')->nullable();
            $table->timestamps();

            $table->unique(['academic_year_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_classes');
    }
};
