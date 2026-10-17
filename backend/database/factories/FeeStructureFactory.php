<?php

namespace Database\Factories;

use App\Models\AcademicTerm;
use App\Models\FeeStructure;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<FeeStructure> */
class FeeStructureFactory extends Factory
{
    protected $model = FeeStructure::class;

    public function definition(): array
    {
        return [
            'name' => 'Tuition',
            'fee_type' => 'tuition',
            'school_class_id' => null,
            'academic_term_id' => AcademicTerm::factory(),
            'amount_pesewas' => 50000,
        ];
    }
}
