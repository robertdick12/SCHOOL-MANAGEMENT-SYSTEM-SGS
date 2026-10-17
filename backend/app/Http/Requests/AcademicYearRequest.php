<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AcademicYearRequest extends FormRequest
{
    public function rules(): array
    {
        $yearId = $this->route('academic_year')?->id;

        return [
            'name' => ['required', 'string', 'max:20', "unique:academic_years,name,{$yearId}"],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'is_current' => ['sometimes', 'boolean'],
        ];
    }
}
