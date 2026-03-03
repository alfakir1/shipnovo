<?php

namespace App\Services\Orchestration;

use App\Models\Shipment;
use App\Models\Partner;
use App\Models\ShipmentPartnerAssignment;
use Illuminate\Support\Facades\DB;

class OrchestrationEngine
{
    /**
     * Simulate 3 shipment quotes
     */
    public function simulateQuotes(array $criteria)
    {
        // Dummy logic to return 3 options
        return [
            [
                'id' => 'quote_economy',
                'name' => 'Economy',
                'price' => 1200,
                'currency' => 'USD',
                'eta_days' => 25,
                'mode' => 'Sea',
                'description' => 'Most affordable option for non-urgent cargo.',
                'partners' => Partner::where('type', 'carrier')->limit(2)->get()
            ],
            [
                'id' => 'quote_balanced',
                'name' => 'Balanced',
                'price' => 2500,
                'currency' => 'USD',
                'eta_days' => 12,
                'mode' => 'Multi-modal',
                'description' => 'Best value combining speed and cost.',
                'partners' => Partner::where('type', 'carrier')->limit(2)->get()
            ],
            [
                'id' => 'quote_fast',
                'name' => 'Fast',
                'price' => 5000,
                'currency' => 'USD',
                'eta_days' => 3,
                'mode' => 'Air',
                'description' => 'Premium express service for urgent electronics.',
                'partners' => Partner::where('type', 'carrier')->limit(2)->get()
            ]
        ];
    }

    /**
     * Assign a partner to a shipment
     */
    public function assignPartner(Shipment $shipment, array $data)
    {
        return DB::transaction(function () use ($shipment, $data) {
            $assignment = ShipmentPartnerAssignment::create([
                'shipment_id' => $shipment->id,
                'partner_id' => $data['partner_id'],
                'leg_type' => $data['leg_type'] ?? 'freight',
                'status' => 'assigned',
                'notes' => $data['notes'] ?? null,
            ]);

            // If it's the primary carrier, we might update shipment status
            if ($shipment->status === 'pending') {
                $shipment->update(['status' => 'processing']);
            }

            return $assignment;
        });
    }
}
