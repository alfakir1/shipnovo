<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Models\Shipment;
use App\Models\Payment;
use App\Observers\AuditObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Shipment::observe(AuditObserver::class);
        Payment::observe(AuditObserver::class);
    }
}
