<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateInvoiceRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:students,id'],
            'academic_term_id' => ['required', 'exists:academic_terms,id'],
        ];
    }
}
