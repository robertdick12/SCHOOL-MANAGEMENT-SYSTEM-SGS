<?php

namespace App\Services\Messaging;

interface SmsGatewayInterface
{
    /**
     * Whether a real provider (e.g. Twilio, Hubtel SMS) is actually
     * configured. Callers should check this before calling send() —
     * the default binding always returns false.
     */
    public function isConfigured(): bool;

    /**
     * @param  string  $toPhoneE164  e.g. "+233240000000"
     *
     * @throws \RuntimeException if no provider is configured
     */
    public function send(string $toPhoneE164, string $message): void;
}
