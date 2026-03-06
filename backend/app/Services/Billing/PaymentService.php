<?php

namespace App\Services\Billing;

use App\Models\Payment;
use App\Models\PaymentTransaction;
use App\Models\Shipment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use App\Services\PaymentGatewayService;

class PaymentService
{
    protected $gateway;

    public function __construct(PaymentGatewayService $gateway)
    {
        $this->gateway = $gateway;
    }

    public function authorize(Shipment $shipment, float $amount, string $currency = 'USD')
    {
        return DB::transaction(function () use ($shipment, $amount, $currency) {
            $intent = $this->gateway->createIntent($amount, $currency, [
                'shipment_id' => $shipment->id,
                'customer_id' => $shipment->customer_id
            ]);

            $payment = Payment::updateOrCreate(
                ['shipment_id' => $shipment->id],
                [
                    'amount' => $amount,
                    'currency' => $currency,
                    'status' => 'pending_authorization',
                    'transaction_id' => $intent['gateway_reference'] ?? $intent['tran_ref'] ?? null,
                ]
            );

            $payment->transactions()->create([
                'type' => 'intent_created',
                'gateway_ref' => $payment->transaction_id,
                'amount' => $amount,
                'status' => 'success',
                'raw_payload' => $intent,
            ]);

            return $payment;
        });
    }

    public function handleWebhook(array $payload)
    {
        // Simple webhook handler logic
        $reference = $payload['reference'] ?? $payload['tran_ref'] ?? null;
        if (!$reference) return null;

        $payment = Payment::where('transaction_id', $reference)->first();
        if (!$payment) return null;

        $verification = $this->gateway->verifyPayment($reference);
        
        if ($verification['success']) {
            return DB::transaction(function () use ($payment, $verification) {
                $payment->update(['status' => $verification['status']]);
                
                $payment->transactions()->create([
                    'type' => 'webhook_update',
                    'gateway_ref' => $verification['gateway_ref'],
                    'amount' => $verification['amount'],
                    'status' => 'success',
                    'raw_payload' => $verification,
                ]);

                return $payment;
            });
        }

        return null;
    }

    public function capture(Payment $payment)
    {
        if ($payment->status !== 'authorized') {
            throw new \Exception("Payment cannot be captured because its status is '{$payment->status}'. It must be 'authorized' first.");
        }

        $shipment = $payment->shipment;
        if (!in_array($shipment->status, ['at_destination', 'delivered'])) {
            throw new \Exception("Payment cannot be captured for a shipment in '{$shipment->status}' status. Shipment must be 'at_destination' or 'delivered'.");
        }

        return DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => 'captured',
                'transaction_id' => 'cap_' . Str::random(12),
            ]);

            // Update associated invoices
            \App\Models\Invoice::where('shipment_id', $payment->shipment_id)
                ->where('status', 'authorized')
                ->update(['status' => 'captured']);

            $payment->transactions()->create([
                'type' => 'capture',
                'gateway_ref' => $payment->transaction_id,
                'amount' => $payment->amount,
                'status' => 'success',
                'raw_payload' => ['mock' => true, 'timestamp' => now()],
            ]);

            return $payment;
        });
    }

    public function refund(Payment $payment, float $amount = null)
    {
        $refundAmount = $amount ?? $payment->amount;

        return DB::transaction(function () use ($payment, $refundAmount) {
            $payment->update(['status' => 'refunded']);

            $payment->transactions()->create([
                'type' => 'refund',
                'gateway_ref' => 'ref_' . Str::random(12),
                'amount' => $refundAmount,
                'status' => 'success',
                'raw_payload' => ['mock' => true, 'timestamp' => now()],
            ]);

            return $payment;
        });
    }
}
