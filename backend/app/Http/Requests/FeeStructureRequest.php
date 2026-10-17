<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FeeStructureRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'fee_type' => ['required', Rule::in(['tuition', 'transport', 'other'])],
            'school_class_id' => ['nullable', 'exists:school_classes,id'],
            'academic_term_id' => ['required', 'exists:academic_terms,id'],
            'amount_pesewas' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
