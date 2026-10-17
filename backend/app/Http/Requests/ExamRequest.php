<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExamRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'academic_term_id' => ['required', 'exists:academic_terms,id'],
            'exam_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'venue' => ['nullable', 'string', 'max:100'],
            'instructions' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
