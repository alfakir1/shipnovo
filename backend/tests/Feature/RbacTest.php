<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Partner;
use App\Models\Shipment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    public function test_partner_cannot_see_unassigned_shipment()
    {
        $partnerUser = User::factory()->create(['role' => 'partner']);
        Partner::create([
            'user_id' => $partnerUser->id,
            'company_name' => 'Carrier X',
            'role_type' => 'carrier',
        ]);
        
        $otherShipper = User::factory()->create(['role' => 'customer']);
        $shipment = Shipment::create([
            'tracking_number' => 'SNV-SECRET',
            'customer_id' => $otherShipper->id,
            'created_by' => $otherShipper->id,
            'origin' => 'A',
            'destination' => 'B',
        ]);

        $response = $this->actingAs($partnerUser, 'sanctum')
            ->getJson("/api/shipments/{$shipment->id}");
        
        $response->assertStatus(403);
    }

    public function test_customer_cannot_approve_partners()
    {
        $shipper = User::factory()->create(['role' => 'customer']);
        $partnerUser = User::factory()->create(['role' => 'partner']);
        $partner = Partner::create([
            'user_id' => $partnerUser->id,
            'company_name' => 'Pending Partner',
            'role_type' => 'carrier',
            'is_verified' => false,
        ]);

        $response = $this->actingAs($shipper, 'sanctum')
            ->patchJson("/api/partners/{$partner->id}/approve");
        
        $response->assertStatus(403);
    }
}
