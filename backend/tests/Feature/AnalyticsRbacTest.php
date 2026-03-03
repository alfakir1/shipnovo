<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Shipment;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test Suite: Analytics RBAC
 *
 * Covers:
 * 1. Customer can access their OWN analytics - only their data returned
 * 2. Customer CANNOT access Ops analytics endpoint
 * 3. Ops/Admin CAN access Ops analytics
 * 4. Analytics response includes expected new fields (avg_delivery_time_days, best_carrier)
 */
class AnalyticsRbacTest extends TestCase
{
    use RefreshDatabase;

    // ── 1. Customer reaches /analytics/customer and gets 200 ─────────────────

    public function test_customer_can_access_customer_analytics(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')
            ->getJson('/api/analytics/customer');

        $response->assertStatus(200);
    }

    // ── 2. Customer analytics only includes THEIR OWN shipments ──────────────

    public function test_customer_analytics_reflects_only_own_shipments(): void
    {
        $customerA = User::factory()->create(['role' => 'customer']);
        $customerB = User::factory()->create(['role' => 'customer']);

        // CustomerA has an active shipment
        Shipment::factory()->create([
            'customer_id' => $customerA->id,
            'status'      => 'processing',
        ]);

        // CustomerB has no shipments
        $response = $this->actingAs($customerB, 'sanctum')
            ->getJson('/api/analytics/customer');

        $response->assertStatus(200);
        $response->assertJsonPath('data.active_shipments', 0);
    }

    // ── 3. Customer CANNOT access Ops analytics endpoint ─────────────────────

    public function test_customer_cannot_access_ops_analytics(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')
            ->getJson('/api/analytics/ops');

        $response->assertStatus(403);
    }

    // ── 4. Partner CANNOT access Ops analytics endpoint ──────────────────────

    public function test_partner_cannot_access_ops_analytics(): void
    {
        $partner = User::factory()->create(['role' => 'partner']);

        $response = $this->actingAs($partner, 'sanctum')
            ->getJson('/api/analytics/ops');

        $response->assertStatus(403);
    }

    // ── 5. Ops CAN access Ops analytics endpoint ─────────────────────────────

    public function test_ops_can_access_ops_analytics(): void
    {
        $ops = User::factory()->create(['role' => 'ops']);

        $response = $this->actingAs($ops, 'sanctum')
            ->getJson('/api/analytics/ops');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => ['overview', 'performance']]);
    }

    // ── 6. Admin CAN access Ops analytics endpoint ───────────────────────────

    public function test_admin_can_access_ops_analytics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/analytics/ops');

        $response->assertStatus(200);
    }

    // ── 7. Customer analytics response includes new P1 fields ─────────────────

    public function test_customer_analytics_includes_new_p1_fields(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer, 'sanctum')
            ->getJson('/api/analytics/customer');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => [
            'spend_mtd',
            'active_shipments',
            'total_volume_stored',
            'shipment_status_distribution',
            'avg_delivery_time_days',
            'best_carrier',
        ]]);
    }

    // ── 8. Unauthenticated user cannot access analytics ──────────────────────

    public function test_unauthenticated_user_cannot_access_analytics(): void
    {
        $this->getJson('/api/analytics/customer')->assertStatus(401);
        $this->getJson('/api/analytics/ops')->assertStatus(401);
    }
}
