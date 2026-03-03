<?php

namespace App\Services\Billing;

use App\Models\Shipment;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BillingService
{
    public function getInvoice(Shipment $shipment)
    {
        return $shipment->invoices()->with('items')->latest()->first();
    }

    public function generate(Shipment $shipment, $userId)
    {
        return DB::transaction(function () use ($shipment, $userId) {
            $customer = $shipment->customer;
            $items = [];

            // 1. Subscription Fee (Simulated based on plan)
            $plan = $customer->subscription_plan ?? 'Basic';
            $plans = [
                'Basic' => 300,
                'Professional' => 600,
                'Enterprise' => 1200,
            ];
            $subAmount = $plans[$plan] ?? 300;
            
            $items[] = [
                'description' => "Subscription Plan: {$plan}",
                'amount' => $subAmount,
                'type' => 'subscription'
            ];

            // 2. Freight Commission (2-5% of shipment value)
            // If internal_value is not in DB, use a default or weight-based simulation
            $shipmentValue = $shipment->internal_value ?? 10000; 
            $commissionRate = 0.05; // 5%
            $commissionAmount = $shipmentValue * $commissionRate;
            
            $items[] = [
                'description' => "Freight Coordination Commission (5%)",
                'amount' => $commissionAmount,
                'type' => 'freight_commission'
            ];

            // 3. Customs Coordination ($350)
            $items[] = [
                'description' => "Customs Coordination Fee",
                'amount' => 350.00,
                'type' => 'customs_fee'
            ];

            // 4. Warehousing ($30 per pallet)
            $palletCount = $shipment->pallet_count ?? 1;
            $warehousingAmount = $palletCount * 30.00;
            
            $items[] = [
                'description' => "Warehousing Coordination ({$palletCount} pallets)",
                'amount' => $warehousingAmount,
                'type' => 'warehousing_fee'
            ];

            $totalAmount = array_sum(array_column($items, 'amount'));

            $invoice = Invoice::create([
                'shipment_id' => $shipment->id,
                'issued_by_user_id' => $userId,
                'invoice_number' => 'INV-' . strtoupper(Str::random(10)),
                'amount' => $totalAmount,
                'currency' => 'USD',
                'status' => 'pending',
                'due_date' => now()->addDays(30),
            ]);

            foreach ($items as $item) {
                $invoice->items()->create($item);
            }

            return $invoice->load('items');
        });
    }
}
