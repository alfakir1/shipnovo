<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Shipment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_ops_can_generate_invoice()
    {
        $shipper = User::factory()->create(['role' => 'customer']);
        $ops = User::factory()->create(['role' => 'ops']);
        
        $shipment = Shipment::create([
            'tracking_number' => 'INV-TEST-123',
            'customer_id' => $shipper->id,
            'created_by' => $ops->id,
            'origin' => 'A',
            'destination' => 'B',
            'status' => 'at_destination',
        ]);

        $response = $this->actingAs($ops, 'sanctum')
            ->postJson("/api/shipments/{$shipment->id}/invoice");

        if ($response->status() !== 201) {
            dump($response->json());
        }
        
        $response->assertStatus(201);
    }
}
