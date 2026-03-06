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

            // 1. Base Freight Service
            $freightPrice = $shipment->customer_price ?? ($shipment->internal_value * 1.10) ?? 1000;
            
            $items[] = [
                'description' => "Freight Service & Coordination ({$shipment->mode})",
                'amount' => $freightPrice,
                'type' => 'freight_service'
            ];

            // 2. Optional: Warehousing if pallets > 1 (For demonstration, 0 for now so totals match UI)
            // To ensure totals match the explicit UI payment banner precisely, we'll keep it simple.

            $totalAmount = array_sum(array_column($items, 'amount'));

            $invoice = Invoice::create([
                'shipment_id' => $shipment->id,
                'issued_by_user_id' => $userId,
                'invoice_number' => 'INV-' . strtoupper(Str::random(10)),
                'amount' => $totalAmount,
                'currency' => 'USD',
                'status' => 'unpaid', // Changed from 'pending' to 'unpaid' to match migration default
                'due_date' => now()->addDays(30),
            ]);

            foreach ($items as $item) {
                $invoice->items()->create($item);
            }

            return $invoice->load('items');
        });
    }
}
