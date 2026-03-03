<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Partner;
use App\Models\Shipment;
use App\Models\Quote;
use App\Models\Payment;
use App\Models\PaymentTransaction;
use App\Models\TrackingEvent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class P0Seeder extends Seeder
{
    public function run(): void
    {
        $shipper = User::where('email', 'customer@example.com')->first();
        $carrierUser = User::where('email', 'carrier@globalcarrier.com')->first();
        $admin = User::where('email', 'admin@shipnovo.com')->first();

        $carrier = Partner::where('user_id', $carrierUser->id)->first();

        // 1. Create RFQ Shipment
        $shipment = Shipment::create([
            'tracking_number' => 'SNV-RFQ-001',
            'customer_id' => $shipper->id,
            'created_by' => $shipper->id,
            'status' => 'rfq',
            'origin' => 'Shanghai, China',
            'destination' => 'Dubai, UAE',
            'mode' => 'sea',
            'service_type' => 'door_to_door',
            'total_weight' => 5000,
            'cargo_type' => 'electronics',
        ]);

        // 2. Submit Quote
        $quote = Quote::create([
            'shipment_id' => $shipment->id,
            'partner_id' => $carrier->id,
            'amount' => 4500,
            'currency' => 'USD',
            'eta_days' => 18,
            'status' => 'pending',
            'notes' => 'Direct sea freight with premium handling.',
        ]);

        // 3. Select Quote
        $quote->update(['status' => 'accepted']);
        $shipment->update(['status' => 'processing', 'customer_price' => 4500]);

        // 4. Authorize Payment
        $payment = Payment::create([
            'shipment_id' => $shipment->id,
            'amount' => 4500,
            'currency' => 'USD',
            'status' => 'authorized',
            'transaction_id' => 'auth_' . Str::random(10),
        ]);

        $payment->transactions()->create([
            'type' => 'authorize',
            'gateway_ref' => $payment->transaction_id,
            'amount' => 4500,
            'status' => 'success',
        ]);

        // 5. Tracking Milestone
        TrackingEvent::create([
            'shipment_id' => $shipment->id,
            'status_code' => 'booked',
            'location' => 'Shanghai Port',
            'description' => 'Shipment has been booked and is awaiting pickup from supplier.',
            'created_by' => $carrierUser->id,
        ]);
    }
}
