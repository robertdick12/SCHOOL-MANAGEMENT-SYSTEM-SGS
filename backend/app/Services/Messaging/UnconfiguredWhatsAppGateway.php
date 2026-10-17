<?php

namespace App\Services\Messaging;

use RuntimeException;

/**
 * Default binding for WhatsAppGatewayInterface. No WhatsApp Business API
 * account exists yet. See UnconfiguredSmsGateway for the reasoning — same
 * pattern, swap the binding in AppServiceProvider once credentials exist.
 */
class UnconfiguredWhatsAppGateway implements WhatsAppGatewayInterface
{
    public function isConfigured(): bool
    {
        return false;
    }

    public function send(string $toPhoneE164, string $message): void
    {
        throw new RuntimeException(
            'WhatsApp sending is not configured — no provider account exists yet. '.
            'Bind WhatsAppGatewayInterface to a real implementation (e.g. Meta WhatsApp '.
            'Business API, Twilio) in AppServiceProvider once credentials are available.'
        );
    }
}
