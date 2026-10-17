<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProvisionLoginRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', Rule::unique('users', 'email')],
        ];
    }
}
