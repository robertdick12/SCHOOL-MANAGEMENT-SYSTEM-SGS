<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordPaymentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:students,id'],
            'amount_pesewas' => ['required', 'integer', 'min:1'],
            'method' => ['required', Rule::in(['cash', 'mobile_money', 'bank_transfer', 'cheque'])],
            'notes' => ['nullable', 'string', 'max:500'],
            'invoice_id' => ['nullable', 'exists:invoices,id'],
        ];
    }
}
