<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Shipment;
use App\Models\Partner;
use App\Models\ShipmentPartnerAssignment;
use App\Models\TrackingEvent;
use App\Models\Invoice;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ShipmentSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('email', 'customer@example.com')->first();
        $ops = User::where('email', 'ops@shipnovo.com')->first();
        $carrier = Partner::where('company_name', 'Global Carrier Co.')->first();
        $customs = Partner::where('company_name', 'FastCustoms Ltd.')->first();

        // 1. Create the "Urgent Electronics" Shipment
        $shipment = Shipment::create([
            'tracking_number' => 'SNV-URGENT01',
            'customer_id' => $customer->id,
            'created_by' => $customer->id,
            'status' => 'assigned',
            'origin' => 'Shenzhen, CN',
            'destination' => 'Riyadh, SA',
            'total_weight' => 150.00,
            'weight_unit' => 'kg',
            'description' => 'Urgent Electronics Shipment',
            'internal_value' => 12000.00,
            'pallet_count' => 2,
        ]);

        // Assignments
        ShipmentPartnerAssignment::create([
            'shipment_id' => $shipment->id,
            'partner_id' => $carrier->id,
            'leg_type' => 'freight',
            'status' => 'in_progress',
        ]);

        ShipmentPartnerAssignment::create([
            'shipment_id' => $shipment->id,
            'partner_id' => $customs->id,
            'leg_type' => 'customs',
            'status' => 'assigned',
        ]);

        // Events
        TrackingEvent::create([
            'shipment_id' => $shipment->id,
            'status_code' => 'booked',
            'location' => 'Shenzhen',
            'description' => 'Shipment booked via Balanced Quote',
            'created_by' => $customer->id,
        ]);

        TrackingEvent::create([
            'shipment_id' => $shipment->id,
            'status_code' => 'picked_up',
            'location' => 'Shenzhen Warehouse',
            'description' => 'Cargo Picked Up from Warehouse',
            'created_by' => $carrier->user_id,
        ]);

        // Invoice
        Invoice::create([
            'shipment_id' => $shipment->id,
            'issued_by_user_id' => $ops->id,
            'amount' => 2500.00,
            'currency' => 'USD',
            'status' => 'pending',
        ]);
    }
}
