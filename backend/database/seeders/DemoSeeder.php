<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Partner;
use App\Models\Shipment;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * DemoSeeder — creates a reproducible demo environment.
 *
 * Demo Accounts:
 *   admin@shipnovo.com   | password  | Admin
 *   ops@shipnovo.com     | password  | Ops
 *   customer@example.com | password  | Customer (Electronics Importer)
 *   carrier@globalcarrier.com | password | Partner / Carrier
 *   customs@fastcustoms.com   | password | Partner / Customs
 *
 * Demo shipments cover each status in the Shipper Journey.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ────────────────────────────────────────────────────────────
        $admin = User::updateOrCreate(['email' => 'admin@shipnovo.com'], [
            'name' => 'ShipNovo Admin', 'password' => Hash::make('password'), 'role' => 'admin',
        ]);

        User::updateOrCreate(['email' => 'ops@shipnovo.com'], [
            'name' => 'Ops Agent', 'password' => Hash::make('password'), 'role' => 'ops',
        ]);

        $customer = User::updateOrCreate(['email' => 'customer@example.com'], [
            'name' => 'Electronics Importer', 'password' => Hash::make('password'),
            'role' => 'customer', 'subscription_plan' => 'Basic',
        ]);

        $carrierUser = User::updateOrCreate(['email' => 'carrier@globalcarrier.com'], [
            'name' => 'Global Carrier Co.', 'password' => Hash::make('password'), 'role' => 'partner',
        ]);

        $customsUser = User::updateOrCreate(['email' => 'customs@fastcustoms.com'], [
            'name' => 'FastCustoms Ltd.', 'password' => Hash::make('password'), 'role' => 'partner',
        ]);

        // ── Partners ─────────────────────────────────────────────────────────
        $carrier = Partner::updateOrCreate(['user_id' => $carrierUser->id], [
            'company_name' => 'Global Freight Solutions', 'role_type' => 'carrier',
            'is_verified' => true,
        ]);

        Partner::updateOrCreate(['user_id' => $customsUser->id], [
            'company_name' => 'FastCustoms Ltd.', 'role_type' => 'customs',
            'is_verified' => true,
        ]);

        // ── Demo Shipments ───────────────────────────────────────────────────

        // 1. RFQ Shipment — customer waiting for quotes (Stage 3/4)
        $rfq = Shipment::create([
            'tracking_number' => 'SN-DEMO-RFQ',
            'customer_id'     => $customer->id,
            'origin'          => 'Shanghai, China',
            'destination'     => 'Jeddah, Saudi Arabia',
            'status'          => 'rfq',
            'mode'            => 'sea',
            'service_type'    => 'standard',
            'cargo_type'      => 'general',
            'total_weight'    => 1200,
            'weight_unit'     => 'kg',
            'description'     => 'Consumer electronics batch Q1',
            'customer_price'  => 0,
            'internal_value'  => 0,
            'pickup_date'     => now()->addDays(5)->format('Y-m-d'),
            'tracking_token'  => 'tk_demo_rfq',
            'created_by'      => $customer->id,
        ]);

        // 2. Processing Shipment — payment authorized, escrow held (Stage 4/5)
        $processing = Shipment::create([
            'tracking_number' => 'SN-DEMO-PAY',
            'customer_id'     => $customer->id,
            'origin'          => 'Dubai, UAE',
            'destination'     => 'Riyadh, Saudi Arabia',
            'status'          => 'processing',
            'mode'            => 'land',
            'service_type'    => 'express',
            'cargo_type'      => 'fragile',
            'total_weight'    => 500,
            'weight_unit'     => 'kg',
            'description'     => 'Display screens for retail chain',
            'customer_price'  => 3500,
            'internal_value'  => 2800,
            'pickup_date'     => now()->addDay()->format('Y-m-d'),
            'tracking_token'  => 'tk_demo_pay',
            'created_by'      => $customer->id,
        ]);

        Payment::create([
            'shipment_id'    => $processing->id,
            'amount'         => 3500,
            'currency'       => 'USD',
            'status'         => 'authorized',
            'transaction_id' => 'txn_demo_' . Str::random(10),
        ]);

        // 3. In-Transit Shipment — tracking events logged (Stage 5)
        $transit = Shipment::create([
            'tracking_number' => 'SN-DEMO-TRANSIT',
            'customer_id'     => $customer->id,
            'origin'          => 'Guangzhou, China',
            'destination'     => 'Dammam, Saudi Arabia',
            'status'          => 'transit',
            'mode'            => 'sea',
            'service_type'    => 'economy',
            'cargo_type'      => 'general',
            'total_weight'    => 3000,
            'weight_unit'     => 'kg',
            'description'     => 'Furniture components',
            'customer_price'  => 7200,
            'internal_value'  => 5500,
            'pickup_date'     => now()->subDays(10)->format('Y-m-d'),
            'tracking_token'  => 'tk_demo_transit',
            'created_by'      => $customer->id,
        ]);

        $transit->events()->createMany([
            [
                'status' => 'picked_up',
                'status_code' => 'PKUP',
                'description' => 'Cargo picked up at Guangzhou warehouse',
                'is_current' => false,
                'created_by' => $admin->id,
            ],
            [
                'status' => 'port_departure',
                'status_code' => 'DEPT',
                'description' => 'Vessel departed Guangzhou port',
                'is_current' => true,
                'created_by' => $admin->id,
            ],
        ]);

        // 4. Delivered Shipment — awaiting receipt confirmation (Stage 6)
        $delivered = Shipment::create([
            'tracking_number' => 'SN-DEMO-DELIVERED',
            'customer_id'     => $customer->id,
            'origin'          => 'Istanbul, Turkey',
            'destination'     => 'Riyadh, Saudi Arabia',
            'status'          => 'at_destination',
            'mode'            => 'air',
            'service_type'    => 'express',
            'cargo_type'      => 'perishable',
            'total_weight'    => 200,
            'weight_unit'     => 'kg',
            'description'     => 'Textile samples for fashion show',
            'customer_price'  => 2100,
            'internal_value'  => 1600,
            'pickup_date'     => now()->subDays(3)->format('Y-m-d'),
            'tracking_token'  => 'tk_demo_delivered',
            'created_by'      => $customer->id,
        ]);

        Payment::create([
            'shipment_id'    => $delivered->id,
            'amount'         => 2100,
            'currency'       => 'USD',
            'status'         => 'authorized',
            'transaction_id' => 'txn_demo_del_' . Str::random(10),
        ]);
    }
}
