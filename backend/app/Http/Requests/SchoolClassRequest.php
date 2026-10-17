<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SchoolClassRequest extends FormRequest
{
    public function rules(): array
    {
        $classId = $this->route('school_class')?->id;

        return [
            'name' => [
                'required', 'string', 'max:50',
                Rule::unique('school_classes', 'name')
                    ->where('academic_year_id', $this->input('academic_year_id'))
                    ->ignore($classId),
            ],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'class_teacher_id' => ['nullable', 'exists:teachers,id'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:200'],
        ];
    }
}
