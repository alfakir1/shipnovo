<?php

namespace App\Services\Shipment;

use App\Models\Shipment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ShipmentEngine
{
    /**
     * List shipments with role-based filtering
     */
    public function listForUser(User $user, array $filters = [])
    {
        $query = Shipment::with(['customer', 'creator']);
        
        if (in_array($user->role, ['admin', 'ops', 'partner'])) {
            $query->with(['activeReturn', 'rating']);
        }

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        } elseif ($user->role === 'partner') {
            $query->where(function ($q) use ($user) {
                // Assigned shipments
                $q->whereHas('assignments', function ($aq) use ($user) {
                    $aq->whereHas('partner', function ($pq) use ($user) {
                        $pq->where('user_id', $user->id);
                    });
                })
                // OR Invited RFQs
                ->orWhere(function ($iq) use ($user) {
                    $iq->whereIn('status', ['rfq', 'pending', 'offers_received'])
                       ->whereHas('invitations', function ($invQ) use ($user) {
                           $invQ->whereHas('partner', function ($pq) use ($user) {
                               $pq->where('user_id', $user->id);
                           });
                       });
                });
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate(10);
    }

    /**
     * Create a new shipment
     */
    public function create(array $data, User $creator)
    {
        return DB::transaction(function () use ($data, $creator) {
            // Ensure customer_id mapping if not provied (customer creating for self)
            $customerId = ($creator->role === 'customer') ? $creator->id : ($data['customer_id'] ?? $creator->id);

            $customerPrice = $data['customer_price'] ?? null;
            if (isset($data['package_id'])) {
                $pkg = \App\Models\PricingPackage::find($data['package_id']);
                if ($pkg) {
                    $customerPrice = $pkg->price;
                }
            }

            $shipment = Shipment::create([
                'tracking_token' => 'TKN-' . strtoupper(Str::random(16)),
                'tracking_number' => 'SNV-' . strtoupper(Str::random(8)),
                'customer_id' => $customerId,
                'created_by' => $creator->id,
                'status' => $data['status'] ?? 'rfq',
                'origin' => $data['origin'],
                'destination' => $data['destination'],
                'mode' => $data['mode'] ?? 'sea',
                'service_type' => $data['service_type'] ?? 'standard',
                'customer_price' => $customerPrice,
                'description' => $data['description'] ?? null,
                'total_weight' => $data['total_weight'] ?? null,
                'weight_unit' => $data['weight_unit'] ?? 'kg',
                'volume' => $data['volume'] ?? null,
                'cargo_type' => $data['cargo_type'] ?? 'general',
                'internal_value' => $data['internal_value'] ?? null,
                'pallet_count' => $data['pallet_count'] ?? 1,
                'pickup_date' => $data['pickup_date'] ?? null,
                'package_id' => $data['package_id'] ?? null,
                'needs_storage' => $data['needs_storage'] ?? false,
                'warehouse_id' => $data['warehouse_id'] ?? null,
            ]);

            $adminsAndOps = User::whereIn('role', ['admin', 'ops'])->get();
            \Illuminate\Support\Facades\Notification::send($adminsAndOps, new \App\Notifications\SystemNotification(
                'New Shipment: ' . $shipment->tracking_number,
                'A new shipment was created by ' . $creator->name,
                'system_operation',
                ['shipment_id' => $shipment->id]
            ));

            return $shipment;
        });
    }

    /**
     * Update shipment status (Ops only)
     */
    public function updateStatus(Shipment $shipment, string $status)
    {
        $shipment->update(['status' => $status]);
        return $shipment;
    }
}
