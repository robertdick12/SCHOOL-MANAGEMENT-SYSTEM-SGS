<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Every request is given a Referer matching a configured Sanctum
     * stateful domain, so Sanctum's EnsureFrontendRequestsAreStateful
     * middleware treats test requests the same way it treats the real SPA
     * (session + CSRF guard, not bearer-token auth).
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeader('Referer', 'http://localhost:5173');
    }
}
