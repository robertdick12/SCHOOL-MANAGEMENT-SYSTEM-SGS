<?php

namespace App\Services\Messaging;

use RuntimeException;

/**
 * Default binding for SmsGatewayInterface. No SMS provider account exists
 * yet (e.g. Twilio, Hubtel SMS both require a paid account with no
 * credentials available in this environment). This class exists purely so
 * call sites can be written now — check isConfigured() first, same pattern
 * as PaystackGateway for payments — and swapped to a real implementation
 * later by changing only the binding in AppServiceProvider.
 */
class UnconfiguredSmsGateway implements SmsGatewayInterface
{
    public function isConfigured(): bool
    {
        return false;
    }

    public function send(string $toPhoneE164, string $message): void
    {
        throw new RuntimeException(
            'SMS sending is not configured — no provider account exists yet. '.
            'Bind SmsGatewayInterface to a real implementation (e.g. Twilio, Hubtel SMS) '.
            'in AppServiceProvider once credentials are available.'
        );
    }
}
