<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Partner;
use App\Models\Shipment;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test Suite: Payment Capture RBAC
 *
 * Covers:
 * 1. Customer can only capturePayment on their OWN shipment (not others')
 * 2. Customer can only capture once the payment is in 'authorized' state
 * 3. Partner is FORBIDDEN from capturePayment
 * 4. Ops/Admin CAN capturePayment per policy
 */
class PaymentRbacTest extends TestCase
{
    use RefreshDatabase;

    private function makeShipmentWithPayment(User $customer, string $paymentStatus = 'authorized', string $shipmentStatus = 'at_destination'): array
    {
        $shipment = Shipment::factory()->create([
            'customer_id'    => $customer->id,
            'status'         => $shipmentStatus,
            'customer_price' => 1500,
            'created_by'     => $customer->id,
        ]);

        $payment = Payment::create([
            'shipment_id'    => $shipment->id,
            'amount'         => 1500,
            'currency'       => 'USD',
            'status'         => $paymentStatus,
            'transaction_id' => 'txn_test_' . uniqid(),
        ]);

        return [$shipment, $payment];
    }

    // ── 1. Customer can capture their OWN authorized payment ─────────────────

    public function test_customer_can_capture_their_own_authorized_payment(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        [$shipment] = $this->makeShipmentWithPayment($customer, 'authorized', 'at_destination');

        $response = $this->actingAs($customer, 'sanctum')
            ->postJson("/api/shipments/{$shipment->id}/payments/capture");

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'captured');
    }

    // ── 2. Customer CANNOT capture a payment that is not yet authorized ───────

    public function test_customer_cannot_capture_payment_in_pending_state(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        [$shipment] = $this->makeShipmentWithPayment($customer, 'pending_authorization', 'at_destination');

        $response = $this->actingAs($customer, 'sanctum')
            ->postJson("/api/shipments/{$shipment->id}/payments/capture");

        $response->assertStatus(400);
        $response->assertJsonPath('error.message', "Payment cannot be captured because its status is 'pending_authorization'. It must be 'authorized' first.");
    }

    public function test_customer_cannot_capture_non_delivered_shipment(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        [$shipment] = $this->makeShipmentWithPayment($customer, 'authorized', 'transit');

        $response = $this->actingAs($customer, 'sanctum')
            ->postJson("/api/shipments/{$shipment->id}/payments/capture");

        $response->assertStatus(400);
        $response->assertJsonPath('error.message', "Payment cannot be captured for a shipment in 'transit' status. Shipment must be 'at_destination' or 'delivered'.");
    }

    // ── 3. Customer CANNOT capture ANOTHER customer's payment ─────────────────

    public function test_customer_cannot_capture_another_customers_payment(): void
    {
        $owner    = User::factory()->create(['role' => 'customer']);
        $attacker = User::factory()->create(['role' => 'customer']);
        [$shipment] = $this->makeShipmentWithPayment($owner, 'authorized');

        $response = $this->actingAs($attacker, 'sanctum')
            ->postJson("/api/shipments/{$shipment->id}/payments/capture");

        $response->assertStatus(403);
    }

    // ── 4. Partner is FORBIDDEN from capturePayment ───────────────────────────

    public function test_partner_cannot_capture_payment(): void
    {
        $customer    = User::factory()->create(['role' => 'customer']);
        $partnerUser = User::factory()->create(['role' => 'partner']);
        Partner::create([
            'user_id'      => $partnerUser->id,
            'company_name' => 'Test Carrier',
            'role_type'    => 'carrier',
            'is_verified'  => true,
        ]);
        [$shipment] = $this->makeShipmentWithPayment($customer, 'authorized');

        $response = $this->actingAs($partnerUser, 'sanctum')
            ->postJson("/api/shipments/{$shipment->id}/payments/capture");

        $response->assertStatus(403);
    }

    // ── 5. Ops user CAN capturePayment ────────────────────────────────────────

    public function test_ops_can_capture_payment(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $ops      = User::factory()->create(['role' => 'ops']);
        [$shipment] = $this->makeShipmentWithPayment($customer, 'authorized', 'at_destination');

        $response = $this->actingAs($ops, 'sanctum')
            ->postJson("/api/shipments/{$shipment->id}/payments/capture");

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'captured');
    }

    // ── 6. Admin CAN capturePayment ───────────────────────────────────────────

    public function test_admin_can_capture_payment(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $admin    = User::factory()->create(['role' => 'admin']);
        [$shipment] = $this->makeShipmentWithPayment($customer, 'authorized', 'at_destination');

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/shipments/{$shipment->id}/payments/capture");

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'captured');
    }
}
