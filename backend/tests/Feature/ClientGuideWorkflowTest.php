<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Partner;
use App\Models\Shipment;
use App\Models\Quote;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ClientGuideWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_client_guide_workflow()
    {
        Storage::fake('public');

        // 1. Setup Roles
        $shipper = User::factory()->create(['role' => 'customer']);
        $partnerUser = User::factory()->create(['role' => 'partner']);
        $partner = Partner::create([
            'user_id' => $partnerUser->id,
            'company_name' => 'Fast Logistics',
            'role_type' => 'carrier',
            'is_verified' => true,
        ]);
        $ops = User::factory()->create(['role' => 'ops']);
        $admin = User::factory()->create(['role' => 'admin']);

        // 2. [RFQ] Customer creates shipment
        $response = $this->actingAs($shipper, 'sanctum')
            ->postJson('/api/shipments', [
                'origin' => 'Riyadh, SA',
                'destination' => 'Dubai, UAE',
                'status' => 'rfq',
                'total_weight' => 100,
                'cargo_type' => 'General',
            ]);
        $response->assertStatus(201);
        $shipmentId = $response->json('data.id');

        // 3. [Quoting] Partner submits quote
        $response = $this->actingAs($partnerUser, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/quotes", [
                'amount' => 500,
                'eta_days' => 3,
                'notes' => 'Best price for express land transport.',
            ]);
        $response->assertStatus(201);
        $quoteId = $response->json('data.id');

        // 4. [Selection] Customer selects the quote
        $response = $this->actingAs($shipper, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/quotes/{$quoteId}/select");
        $response->assertStatus(200);

        // 5. [Payment] Customer authorizes payment
        $response = $this->actingAs($shipper, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/payments/authorize", [
                'amount' => 500,
            ]);
        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'authorized');

        // 6. [Assignment] Ops assigns the partner
        $response = $this->actingAs($ops, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/assignments", [
                'partner_id' => $partner->id,
                'leg_type' => 'freight',
            ]);
        $response->assertStatus(201);

        // 7. [Tracking] Partner adds tracking event
        $response = $this->actingAs($partnerUser, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/events", [
                'status_code' => 'picked_up',
                'location' => 'Riyadh Warehouse',
                'description' => 'Shipment collected from the client.',
            ]);
        $response->assertStatus(201);

        // 8. [Support] Customer creates a ticket
        $response = $this->actingAs($shipper, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/tickets", [
                'subject' => 'Inquiry about customs clearance',
            ]);
        $response->assertStatus(201);
        $ticketId = $response->json('data.id');

        // 9. [Support] Ops responds to ticket
        $response = $this->actingAs($ops, 'sanctum')
            ->postJson("/api/tickets/{$ticketId}/comments", [
                'body' => 'We are processing the documents. Will update you shortly.',
            ]);
        $response->assertStatus(201);

        // 10. [Documents] Partner uploads a document
        $file = UploadedFile::fake()->create('bol.pdf', 100);
        $response = $this->actingAs($partnerUser, 'sanctum')
            ->post("/api/shipments/{$shipmentId}/documents", [
                'file' => $file,
                'type' => 'bill_of_lading',
            ], ['Accept' => 'application/json']);
        $response->assertStatus(201);

        // 11. [Billing] Ops generates invoice
        $response = $this->actingAs($ops, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/invoice");
        $response->assertStatus(201);

        // 12. [Completion] Delivery & Final Capture
        Shipment::where('id', $shipmentId)->update(['status' => 'delivered']);
        
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/shipments/{$shipmentId}/payments/capture");
        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'captured');
    }
}
