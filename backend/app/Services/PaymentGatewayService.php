<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentGatewayService
{
    protected $apiKey;
    protected $gateway;

    public function __construct()
    {
        $this->gateway = config('services.payment.gateway', 'stripe'); // stripe or paytabs
        $this->apiKey = config("services.{$this->gateway}.secret_key");
    }

    /**
     * Create a payment intent/session
     */
    public function createIntent($amount, $currency = 'USD', $metadata = [])
    {
        // Mocking real-world API call to Stripe/PayTabs Sandbox
        Log::info("Initiating {$this->gateway} payment for {$amount} {$currency}", $metadata);

        if ($this->gateway === 'stripe') {
            return $this->createStripeIntent($amount, $currency, $metadata);
        }

        return $this->createPayTabsIntent($amount, $currency, $metadata);
    }

    protected function createStripeIntent($amount, $currency, $metadata)
    {
        // In a real scenario, this would be:
        // $response = Http::withToken($this->apiKey)->post('https://api.stripe.com/v1/payment_intents', [...]);
        
        return [
            'client_secret' => 'pi_' . Str::random(24) . '_secret_' . Str::random(24),
            'gateway_reference' => 'pi_' . Str::random(24),
            'status' => 'requires_payment_method'
        ];
    }

    protected function createPayTabsIntent($amount, $currency, $metadata)
    {
        return [
            'tran_ref' => 'TST' . Str::random(10),
            'redirect_url' => 'https://secure.paytabs.com/payment/page/' . Str::random(16),
            'status' => 'pending'
        ];
    }

    /**
     * Verify payment status
     */
    public function verifyPayment($reference)
    {
        Log::info("Verifying {$this->gateway} payment: {$reference}");
        
        // Mock success for sandbox demonstration
        return [
            'success' => true,
            'amount' => 4500,
            'status' => 'captured',
            'gateway_ref' => $reference
        ];
    }
}
