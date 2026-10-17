<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssessmentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(['exam', 'quiz', 'homework', 'project', 'other'])],
            'subject_id' => ['required', 'exists:subjects,id'],
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'academic_term_id' => ['required', 'exists:academic_terms,id'],
            'max_score' => ['required', 'numeric', 'min:1', 'max:1000'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
