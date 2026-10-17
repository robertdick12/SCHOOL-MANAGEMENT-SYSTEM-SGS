<?php

namespace App\Providers;

use App\Services\Messaging\SmsGatewayInterface;
use App\Services\Messaging\UnconfiguredSmsGateway;
use App\Services\Messaging\UnconfiguredWhatsAppGateway;
use App\Services\Messaging\WhatsAppGatewayInterface;
use App\Services\Payments\PaymentGatewayInterface;
use App\Services\Payments\PaystackGateway;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, PaystackGateway::class);

        // Neither has a real provider account yet — see each class's doc
        // comment. Swap these bindings once credentials exist.
        $this->app->bind(SmsGatewayInterface::class, UnconfiguredSmsGateway::class);
        $this->app->bind(WhatsAppGatewayInterface::class, UnconfiguredWhatsAppGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // The default notification links to a Blade route this API-only app
        // doesn't have — point it at the SPA's own reset-password page instead.
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontendUrl = rtrim(config('app.frontend_url'), '/');

            return "{$frontendUrl}/reset-password?token={$token}&email=".urlencode($notifiable->email);
        });
    }
}
