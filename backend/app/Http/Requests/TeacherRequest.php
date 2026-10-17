<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeacherRequest extends FormRequest
{
    public function rules(): array
    {
        $teacher = $this->route('teacher');
        $userId = $teacher?->user_id;

        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'staff_number' => ['required', 'string', 'max:30', Rule::unique('teachers', 'staff_number')->ignore($teacher?->id)],
            'qualification' => ['nullable', 'string', 'max:150'],
            'hire_date' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }
}
