<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Shipment;
use App\Models\Partner;
use App\Models\Quote;
use App\Models\QuoteInvitation;
use App\Models\WorkOrder;
use App\Models\Document;
use App\Models\Ticket;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

class VerifyFlow extends Command
{
    protected $signature = 'verify:flow {--url=http://localhost:8000}';
    protected $description = 'Verify ShipNovo end-to-end flow and RBAC rules';

    protected $baseUrl;
    protected $tokens = [];
    protected $ids = [];

    public function handle()
    {
        $this->baseUrl = $this->option('url') . '/api';
        
        $this->info("Starting ShipNovo Verification Flow...");
        
        try {
            $this->setupUsers();
            
            $this->runPositiveFlow();
            $this->runNegativeRBAC();
            
            $this->info("\n✅ ALL TESTS PASSED!");
        } catch (\Exception $e) {
            $this->error("\n❌ TEST FAILED: " . $e->getMessage());
            file_put_contents('error_detail.txt', $e->getMessage() . "\n\n" . $e->getTraceAsString());
            $this->error("Trace written to error_detail.txt");
            return 1;
        }
    }

    protected function setupUsers()
    {
        $this->info("Setting up users...");
        
        // 1. Shipper
        $shipper = User::updateOrCreate(['email' => 'shipper@test.com'], [
            'name' => 'Test Shipper', 'role' => 'customer', 'password' => bcrypt('password')
        ]);
        $this->tokens['shipper'] = $shipper->createToken('test')->plainTextToken;
        $this->ids['shipper'] = $shipper->id;

        // 2. Other Shipper
        $otherShipper = User::updateOrCreate(['email' => 'other@test.com'], [
            'name' => 'Other Shipper', 'role' => 'customer', 'password' => bcrypt('password')
        ]);
        $this->tokens['other_shipper'] = $otherShipper->createToken('test')->plainTextToken;

        // 3. Partner A (Invited)
        $partnerUserA = User::updateOrCreate(['email' => 'partner_a@test.com'], [
            'name' => 'Partner A', 'role' => 'partner', 'password' => bcrypt('password')
        ]);
        $partnerA = Partner::updateOrCreate(['user_id' => $partnerUserA->id], [
            'company_name' => 'Carrier A', 'role_type' => 'carrier', 'is_verified' => true,
        ]);
        $this->tokens['partner_a'] = $partnerUserA->createToken('test')->plainTextToken;
        $this->ids['partner_a'] = $partnerA->id;

        // 4. Partner B (Not Invited)
        $partnerUserB = User::updateOrCreate(['email' => 'partner_b@test.com'], [
            'name' => 'Partner B', 'role' => 'partner', 'password' => bcrypt('password')
        ]);
        $partnerB = Partner::updateOrCreate(['user_id' => $partnerUserB->id], [
            'company_name' => 'Carrier B', 'role_type' => 'carrier', 'is_verified' => true,
        ]);
        $this->tokens['partner_b'] = $partnerUserB->createToken('test')->plainTextToken;
        $this->ids['partner_b'] = $partnerB->id;

        // 5. Ops
        $ops = User::updateOrCreate(['email' => 'ops@test.com'], [
            'name' => 'Test Ops', 'role' => 'ops', 'password' => bcrypt('password')
        ]);
        $this->tokens['ops'] = $ops->createToken('test')->plainTextToken;
    }

    protected function runPositiveFlow()
    {
        $this->info("\n--- Running Positive Flow ---");
        
        // 1. Create RFQ
        $this->info("1. Creating RFQ (Shipper)...");
        $response = $this->post('/shipments', [
            'origin' => 'Riyadh', 'destination' => 'Dubai', 'status' => 'rfq'
        ], 'shipper');
        $shipmentId = $response['data']['id'];
        $this->ids['shipment'] = $shipmentId;
        $this->verify($response['data']['status'] === 'rfq', "Shipment should be in rfq status");

        // 2. Invite Partner A
        $this->info("2. Inviting Partner A (Ops)...");
        // For now, we seed the invitation directly or via hypothetical endpoint
        // Let's assume we use the model directly to simulate the state
        QuoteInvitation::create([
            'shipment_id' => $shipmentId,
            'partner_id' => $this->ids['partner_a']
        ]);

        // 3. Submit Quote
        $this->info("3. Submitting Quote (Partner A)...");
        $response = $this->post("/shipments/{$shipmentId}/quotes", [
            'amount' => 1500, 'eta_days' => 4, 'currency' => 'USD'
        ], 'partner_a');
        $quoteId = $response['data']['id'];
        $this->ids['quote'] = $quoteId;
        
        $shipment = Shipment::find($shipmentId);
        $this->verify($shipment->status === 'offers_received', "Shipment status should be offers_received after quote");

        // 4. Select Quote
        $this->info("4. Selecting Quote (Shipper)...");
        $this->post("/shipments/{$shipmentId}/quotes/{$quoteId}/select", [], 'shipper');
        $shipment->refresh();
        $this->verify($shipment->status === 'offer_selected', "Shipment status should be offer_selected");

        // 5. Ops Fixes & Assigns -> Processing + Work Order
        $this->info("5. Assigning Partner (Ops)...");
        $this->post("/shipments/{$shipmentId}/assignments", [
            'partner_id' => $this->ids['partner_a'],
            'leg_type' => 'freight'
        ], 'ops');
        
        $shipment->refresh();
        $this->verify($shipment->status === 'processing', "Shipment status should be processing");
        $this->verify(WorkOrder::where('shipment_id', $shipmentId)->exists(), "Work Order should be created");

        // 6. Partner adds Events -> Transit
        $this->info("6. Adding Pickup Event (Partner A)...");
        $this->post("/shipments/{$shipmentId}/events", [
            'status_code' => 'PICKUP', 'location' => 'Riyadh', 'description' => 'Cargo picked up'
        ], 'partner_a');
        $shipment->refresh();
        $this->verify($shipment->status === 'transit', "Shipment status should be transit after pickup event");

        // 7. Documents
        $this->info("7. Uploading Document (Partner A)...");
        // Simulate file upload
        $tempFile = tempnam(sys_get_temp_dir(), 'test');
        file_put_contents($tempFile, 'test content');
        
        $response = Http::withToken($this->tokens['partner_a'])
            ->attach('file', file_get_contents($tempFile), 'doc.txt')
            ->post($this->baseUrl . "/shipments/{$shipmentId}/documents", [
                'type' => 'BL'
            ]);
        
        $this->verify($response->successful(), "Document upload failed: " . $response->body());
        $documentId = $response->json('data.id');

        // Check if downloadable by customer
        $this->info("   Checking document download (Shipper)...");
        $response = Http::withToken($this->tokens['shipper'])
            ->get($this->baseUrl . "/documents/{$documentId}/download");
        
        if (!$response->successful()) {
            $this->error("   Download failed! Status: " . $response->status());
            $this->error("   Body: " . $response->body());
        }
        $this->verify($response->successful(), "Shipper should be able to download document");

        // 8. Tickets
        $this->info("8. Creating Ticket (Shipper)...");
        $response = $this->post("/shipments/{$shipmentId}/tickets", [
            'subject' => 'Issue with cargo'
        ], 'shipper');
        $ticketId = $response['data']['id'];

        $this->info("   Resolving Ticket (Ops)...");
        $this->patch("/tickets/{$ticketId}", ['status' => 'resolved'], 'ops');
        $ticket = Ticket::find($ticketId);
        $this->verify($ticket->status === 'resolved', "Ticket should be resolved");

        // 9. Invoice
        $this->info("9. Generating Invoice (Ops)...");
        $this->post("/shipments/{$shipmentId}/invoice", [], 'ops');
        
        $this->info("   Checking Invoice (Shipper)...");
        $response = Http::withToken($this->tokens['shipper'])
            ->get($this->baseUrl . "/shipments/{$shipmentId}/invoice");
        $this->verify($response->successful(), "Shipper should be able to see invoice");

        $this->info("✔ Positive Flow PASS");
    }

    protected function runNegativeRBAC()
    {
        $this->info("\n--- Running Negative RBAC Tests ---");
        $shipmentId = $this->ids['shipment'];
        $otherShipmentId = Shipment::factory()->create()->id; // Create dummy for cross-access

        // 1. Uninvited Partner cannot see RFQ
        $this->info("1. Uninvited Partner RFQ access...");
        $response = Http::withToken($this->tokens['partner_b'])
            ->acceptJson()->get($this->baseUrl . "/shipments/{$shipmentId}");
        $this->verify($response->status() === 403, "Partner B should get 403 for uninvited RFQ");

        // 2. Partner cannot see other shipment's docs
        $this->info("2. Cross-shipment document access...");
        $doc = Document::first(); // BL from step 7
        $response = Http::withToken($this->tokens['partner_b'])
            ->acceptJson()->get($this->baseUrl . "/documents/{$doc->id}/download");
        $this->verify($response->status() === 403, "Partner B should not access Partner A's documents");

        // 3. Customer cannot assign partner (Ops only)
        $this->info("3. Customer trying Ops action...");
        $response = Http::withToken($this->tokens['shipper'])
            ->acceptJson()->post($this->baseUrl . "/shipments/{$shipmentId}/assignments", [
                'partner_id' => $this->ids['partner_b']
            ]);
        $this->verify($response->status() === 403, "Shipper should get 403 for assignment");

        // 4. Integrity check: Selection from wrong shipment
        $this->info("4. Quote selection integrity...");
        $otherShipment = Shipment::create([
             'origin' => 'X', 'destination' => 'Y', 'customer_id' => $this->ids['shipper'], 'created_by' => $this->ids['shipper']
        ]);
        $response = Http::withToken($this->tokens['shipper'])
            ->acceptJson()->post($this->baseUrl . "/shipments/{$otherShipment->id}/quotes/{$this->ids['quote']}/select");
        $this->verify($response->status() === 422, "Should reject quote from different shipment");

        $this->info("✔ Negative RBAC PASS");
    }

    protected function post($uri, $data, $userKey)
    {
        $response = Http::withToken($this->tokens[$userKey])
            ->acceptJson()->post($this->baseUrl . $uri, $data);
        
        if (!$response->successful()) {
            $this->error("POST {$uri} failed! Status: " . $response->status());
            $this->error("Body: " . $response->body());
            throw new \Exception("POST {$uri} failed ({$response->status()}): " . $response->body());
        }
        return $response->json();
    }

    protected function patch($uri, $data, $userKey)
    {
        $response = Http::withToken($this->tokens[$userKey])
            ->acceptJson()->patch($this->baseUrl . $uri, $data);
        
        if (!$response->successful()) {
            $this->error("PATCH {$uri} failed! Status: " . $response->status());
            $this->error("Body: " . $response->body());
            throw new \Exception("PATCH {$uri} failed ({$response->status()}): " . $response->body());
        }
        return $response->json();
    }

    protected function verify($condition, $message)
    {
        if (!$condition) {
            throw new \Exception($message);
        }
    }
}
