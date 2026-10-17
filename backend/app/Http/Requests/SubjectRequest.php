<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubjectRequest extends FormRequest
{
    public function rules(): array
    {
        $subjectId = $this->route('subject')?->id;

        return [
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', "unique:subjects,code,{$subjectId}"],
        ];
    }
}
