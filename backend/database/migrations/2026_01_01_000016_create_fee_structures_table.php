<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Tuition - JHS 1 - Term 1"
            $table->string('fee_type'); // tuition | transport | other
            // Null school_class_id = applies school-wide for the term.
            $table->foreignId('school_class_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('academic_term_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('amount_pesewas');
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['academic_term_id', 'fee_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};
