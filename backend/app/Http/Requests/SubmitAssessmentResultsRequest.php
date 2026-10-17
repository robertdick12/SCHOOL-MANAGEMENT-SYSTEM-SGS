<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitAssessmentResultsRequest extends FormRequest
{
    public function rules(): array
    {
        $maxScore = (float) $this->route('assessment')->max_score;

        return [
            'results' => ['required', 'array', 'min:1'],
            'results.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'results.*.score' => ['nullable', 'numeric', 'min:0', "max:{$maxScore}"],
            'results.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
