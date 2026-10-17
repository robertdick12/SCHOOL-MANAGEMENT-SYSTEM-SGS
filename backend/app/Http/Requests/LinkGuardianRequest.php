<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LinkGuardianRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:students,id'],
            'relationship' => ['required', Rule::in(['father', 'mother', 'guardian', 'other'])],
            'is_primary_contact' => ['sometimes', 'boolean'],
        ];
    }
}
