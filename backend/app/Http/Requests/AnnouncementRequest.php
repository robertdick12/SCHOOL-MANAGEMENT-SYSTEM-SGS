<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnnouncementRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:5000'],
            'audience' => ['required', Rule::in(['all', 'admin', 'teacher', 'student', 'parent', 'accountant'])],
            'school_class_id' => ['nullable', 'exists:school_classes,id'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
