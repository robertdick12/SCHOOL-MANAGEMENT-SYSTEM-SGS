<?php

namespace App\Services\Payments;

use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Real Paystack API integration. Untested against a live Paystack account —
 * no provider credentials are available in this environment. See
 * docs/payments.md for the exact manual verification steps required before
 * this can be trusted in production.
 */
class PaystackGateway implements PaymentGatewayInterface
{
    private const BASE_URL = 'https://api.paystack.co';

    public function __construct(
        private readonly ?string $secretKey = null,
    ) {
        $this->secretKey ??= config('services.paystack.secret_key');
    }

    public function initialize(Payment $payment, string $callbackUrl): array
    {
        $this->ensureConfigured();

        $response = Http::withToken($this->secretKey)
            ->post(self::BASE_URL.'/transaction/initialize', [
                'email' => $payment->student->user?->email ?? $payment->student->guardians->first()?->email,
                'amount' => $payment->amount_pesewas, // Paystack GHS minor unit is pesewas — matches our schema.
                'reference' => $payment->provider_reference,
                'callback_url' => $callbackUrl,
            ]);

        if (! $response->successful() || ! $response->json('status')) {
            throw new RuntimeException('Paystack initialize failed: '.$response->body());
        }

        return [
            'authorization_url' => $response->json('data.authorization_url'),
            'access_code' => $response->json('data.access_code'),
            'reference' => $response->json('data.reference'),
        ];
    }

    public function verify(string $reference): array
    {
        $this->ensureConfigured();

        $response = Http::withToken($this->secretKey)
            ->get(self::BASE_URL."/transaction/verify/{$reference}");

        if (! $response->successful()) {
            throw new RuntimeException('Paystack verify failed: '.$response->body());
        }

        $data = $response->json('data');

        return [
            'status' => ($data['status'] ?? null) === 'success' ? 'success' : 'failed',
            'amount_pesewas' => (int) ($data['amount'] ?? 0),
            'reference' => $data['reference'] ?? $reference,
        ];
    }

    public function validateWebhookSignature(string $rawPayload, ?string $signatureHeader): bool
    {
        if (! $signatureHeader || ! $this->secretKey) {
            return false;
        }

        $expected = hash_hmac('sha512', $rawPayload, $this->secretKey);

        return hash_equals($expected, $signatureHeader);
    }

    private function ensureConfigured(): void
    {
        if (! $this->secretKey) {
            throw new RuntimeException(
                'Paystack is not configured. Set PAYSTACK_SECRET_KEY to enable live payments, '.
                'or use the manual payment recording workflow instead.'
            );
        }
    }
}
