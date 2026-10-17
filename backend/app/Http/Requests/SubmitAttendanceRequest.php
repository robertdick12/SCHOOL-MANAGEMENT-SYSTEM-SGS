<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitAttendanceRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'records.*.status' => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
            'records.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
