<?php

namespace App\Services\Payments;

use App\Models\Payment;

interface PaymentGatewayInterface
{
    /**
     * Start a hosted payment and return the data the frontend needs to
     * redirect the payer (e.g. an authorization URL and the provider's
     * transaction reference). Must never be called with amounts or status
     * supplied by the browser — only with a Payment row already created
     * server-side in 'pending' status.
     */
    public function initialize(Payment $payment, string $callbackUrl): array;

    /**
     * Ask the provider directly whether a transaction reference succeeded.
     * This is the source of truth — webhooks are only a prompt to call this,
     * never trusted on their own.
     *
     * @return array{status: 'success'|'failed', amount_pesewas: int, reference: string}
     */
    public function verify(string $reference): array;

    /**
     * Validate an inbound webhook's signature against the raw request body.
     */
    public function validateWebhookSignature(string $rawPayload, ?string $signatureHeader): bool;
}
