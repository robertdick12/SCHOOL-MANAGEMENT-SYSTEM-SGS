<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TeacherAssignmentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'teacher_id' => ['required', 'exists:teachers,id'],
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'academic_term_id' => ['required', 'exists:academic_terms,id'],
        ];
    }
}
