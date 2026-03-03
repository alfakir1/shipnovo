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

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        } elseif ($user->role === 'partner') {
            $query->whereHas('assignments', function ($q) use ($user) {
                $q->whereHas('partner', function ($pq) use ($user) {
                    $pq->where('user_id', $user->id);
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

            return Shipment::create([
                'tracking_number' => 'SNV-' . strtoupper(Str::random(8)),
                'customer_id' => $customerId,
                'created_by' => $creator->id,
                'status' => $data['status'] ?? 'pending',
                'origin' => $data['origin'],
                'destination' => $data['destination'],
                'mode' => $data['mode'] ?? 'sea',
                'service_type' => $data['service_type'] ?? 'standard',
                'customer_price' => $data['customer_price'] ?? null,
                'description' => $data['description'] ?? null,
                'total_weight' => $data['total_weight'] ?? null,
                'weight_unit' => $data['weight_unit'] ?? 'kg',
                'volume' => $data['volume'] ?? null,
                'cargo_type' => $data['cargo_type'] ?? 'general',
                'internal_value' => $data['internal_value'] ?? null,
                'pallet_count' => $data['pallet_count'] ?? 1,
            ]);
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
