<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentRequest extends FormRequest
{
    public function rules(): array
    {
        $studentId = $this->route('student')?->id;

        return [
            'admission_number' => ['required', 'string', 'max:30', Rule::unique('students', 'admission_number')->ignore($studentId)],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'admission_date' => ['required', 'date'],
            'status' => ['sometimes', Rule::in(['active', 'graduated', 'withdrawn'])],
        ];
    }
}
