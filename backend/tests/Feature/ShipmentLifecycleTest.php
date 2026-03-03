<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Partner;
use App\Models\Shipment;
use App\Models\Quote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShipmentLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_shipment_lifecycle()
    {
        // 1. Setup Users
        $shipper = User::factory()->create(['role' => 'customer']);
        $partnerUser = User::factory()->create(['role' => 'partner']);
        $partner = Partner::create([
            'user_id' => $partnerUser->id,
            'company_name' => 'Test Carrier',
            'role_type' => 'carrier',
            'is_verified' => true,
        ]);
        $admin = User::factory()->create(['role' => 'admin']);

        // 2. Shipper creates RFQ
        $response = $this->actingAs($shipper, 'sanctum')
            ->postJson('/api/shipments', [
                'origin' => 'Origin A',
                'destination' => 'Dest B',
                'status' => 'rfq',
            ]);
        $response->assertStatus(201);
        $shipmentId = $response->json('data.id');

        // 3. Partner submits quote
        $response = $this->actingAs($partnerUser, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/quotes", [
                'amount' => 1000,
                'eta_days' => 5,
            ]);
        $response->assertStatus(201);
        $quoteId = $response->json('data.id');

        // 4. Shipper selects quote
        $response = $this->actingAs($shipper, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/quotes/{$quoteId}/select");
        $response->assertStatus(200);

        // 5. Shipper authorizes payment
        $response = $this->actingAs($shipper, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/payments/authorize", [
                'amount' => 1000,
            ]);
        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'authorized');

        // 6. Admin captures payment
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/payments/capture");
        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'captured');
    }
}
