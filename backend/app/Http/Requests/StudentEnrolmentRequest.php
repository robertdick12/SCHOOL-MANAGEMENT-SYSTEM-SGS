<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentEnrolmentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:students,id'],
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'enrolled_at' => ['required', 'date'],
            'status' => ['sometimes', Rule::in(['active', 'transferred', 'withdrawn'])],
        ];
    }
}
