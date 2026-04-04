<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Warehouse;
use App\Models\InventoryItem;
use App\Models\Partner;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Auth;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (in_array($user->role, ['admin', 'ops'])) {
            $warehouses = Warehouse::with('partner')->get();
        } elseif ($user->role === 'partner') {
            $partner = Partner::where('user_id', $user->id)->first();
            $warehouses = Warehouse::where('partner_id', $partner->id)->get();
        } else {
            // For customers, show all active warehouses (available for booking)
            $warehouses = Warehouse::where('status', 'active')->get();
        }

        return ApiResponse::ok($warehouses);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $isAdmin = in_array($user->role, ['admin', 'ops']);

        if ($user->role !== 'partner' && !$isAdmin) {
            return ApiResponse::error('FORBIDDEN', 'Only partners or admin/ops can create warehouses', [], 403);
        }

        $partnerId = $request->partner_id;

        if ($user->role === 'partner') {
            $partner = Partner::where('user_id', $user->id)->first();
            if (!$partner || !$partner->is_verified) {
                return ApiResponse::error('UNAUTHORIZED', 'Partner not verified', [], 401);
            }
            $partnerId = $partner->id;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'total_capacity' => 'required|numeric|min:0',
            'partner_id' => $isAdmin ? 'nullable|exists:partners,id' : 'nullable',
        ]);

        $warehouse = Warehouse::create([
            'partner_id' => $partnerId,
            'name' => $validated['name'],
            'location' => $validated['location'],
            'total_capacity' => $validated['total_capacity'],
            'available_capacity' => $validated['total_capacity'],
            'status' => 'active',
        ]);

        return ApiResponse::created($warehouse);
    }

    public function inventory(Request $request, $id)
    {
        $warehouse = Warehouse::findOrFail($id);
        $user = $request->user();

        // Check permission
        if ($user->role === 'partner') {
            $partner = Partner::where('user_id', $user->id)->first();
            if ($warehouse->partner_id !== $partner->id) {
                return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
            }
            $inventory = InventoryItem::with('customer')->where('warehouse_id', $id)->get();
        } elseif (in_array($user->role, ['admin', 'ops'])) {
            $inventory = InventoryItem::with('customer')->where('warehouse_id', $id)->get();
        } else {
            $inventory = InventoryItem::where('warehouse_id', $id)
                ->where('customer_id', $user->id)
                ->get();
        }

        return ApiResponse::ok($inventory);
    }

    public function requestStorage(Request $request)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'pricing_model' => 'required|string|in:monthly,per_m3',
            'rate' => 'required|numeric|min:0',
            'cargo_type' => 'nullable|string',
            'estimated_volume' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $contract = \App\Models\StorageContract::create([
            'warehouse_id' => $validated['warehouse_id'],
            'customer_id' => $request->user()->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'status' => 'pending', // Default to pending for approval
            'pricing_model' => $validated['pricing_model'],
            'rate' => $validated['rate'],
            'cargo_type' => $validated['cargo_type'] ?? null,
            'estimated_volume' => $validated['estimated_volume'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return ApiResponse::created($contract);
    }

    public function contracts(Request $request)
    {
        $user = $request->user();
        if (in_array($user->role, ['admin', 'ops'])) {
            $contracts = \App\Models\StorageContract::with(['warehouse', 'customer'])->latest()->get();
        } else {
            $contracts = \App\Models\StorageContract::with('warehouse')->where('customer_id', $user->id)->latest()->get();
        }
        return ApiResponse::ok($contracts);
    }

    public function updateStorageRequest(Request $request, $id)
    {
        $user = $request->user();
        $contract = \App\Models\StorageContract::findOrFail($id);

        if ($user->role !== 'admin' && $user->role !== 'ops' && $contract->customer_id !== $user->id) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        if ($contract->status !== 'pending' && !in_array($user->role, ['admin', 'ops'])) {
            return ApiResponse::error('BAD_REQUEST', 'Only pending requests can be edited', [], 400);
        }

        $validated = $request->validate([
            'warehouse_id' => 'sometimes|exists:warehouses,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'cargo_type' => 'sometimes|string',
            'estimated_volume' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string',
            'pricing_model' => 'sometimes|string|in:monthly,per_m3',
            'rate' => 'sometimes|numeric|min:0',
        ]);

        $contract->update($validated);

        return ApiResponse::ok($contract->load('warehouse'));
    }

    public function deleteStorageRequest(Request $request, $id)
    {
        $user = $request->user();
        $contract = \App\Models\StorageContract::findOrFail($id);

        if ($user->role !== 'admin' && $user->role !== 'ops' && $contract->customer_id !== $user->id) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        if ($contract->status !== 'pending' && !in_array($user->role, ['admin', 'ops'])) {
            return ApiResponse::error('BAD_REQUEST', 'Only pending requests can be deleted', [], 400);
        }

        $contract->delete();

        return ApiResponse::ok(['deleted' => true]);
    }

    public function approveContract($id, Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'ops'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $contract = \App\Models\StorageContract::findOrFail($id);
        $contract->update(['status' => 'active']);

        // Notify Customer
        $contract->customer->notify(new \App\Notifications\StorageContractStatusNotification($contract, 'active'));

        return ApiResponse::ok($contract->load(['warehouse', 'customer']));
    }

    public function rejectContract($id, Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'ops'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $contract = \App\Models\StorageContract::findOrFail($id);
        $contract->update(['status' => 'rejected']);

        // Notify Customer
        $contract->customer->notify(new \App\Notifications\StorageContractStatusNotification($contract, 'rejected'));

        return ApiResponse::ok($contract);
    }

    public function logInventory(Request $request, $id)
    {
        $user = $request->user();
        $warehouse = Warehouse::findOrFail($id);

        // Only ops/admin/partner-owner can log items; customer via ops
        if ($user->role === 'partner') {
            $partner = Partner::where('user_id', $user->id)->first();
            if ($warehouse->partner_id !== $partner?->id) {
                return ApiResponse::error('FORBIDDEN', 'You do not own this warehouse', [], 403);
            }
        } elseif ($user->role === 'customer') {
            return ApiResponse::error('FORBIDDEN', 'Customers cannot log inventory directly', [], 403);
        }

        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'sku' => 'required|string|max:100',
            'name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'weight_per_unit' => 'nullable|numeric|min:0',
            'volume_per_unit' => 'nullable|numeric|min:0',
        ]);

        // Upsert: if same SKU + customer + warehouse, increase quantity
        $item = InventoryItem::where('warehouse_id', $id)
            ->where('customer_id', $request->customer_id)
            ->where('sku', $request->sku)
            ->first();

        if ($item) {
            $item->increment('quantity', $request->quantity);
        } else {
            $item = InventoryItem::create([
                'warehouse_id' => $id,
                'customer_id' => $request->customer_id,
                'sku' => $request->sku,
                'name' => $request->name,
                'quantity' => $request->quantity,
                'weight_per_unit' => $request->weight_per_unit,
                'volume_per_unit' => $request->volume_per_unit,
            ]);
        }

        return ApiResponse::created($item->fresh()->load('customer'));
    }

    public function deleteInventoryItem(Request $request, $id, $itemId)
    {
        $user = $request->user();
        if (!in_array($user->role, ['ops', 'admin', 'partner'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $item = InventoryItem::where('warehouse_id', $id)->findOrFail($itemId);
        $item->delete();

        return ApiResponse::ok(['deleted' => true]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $warehouse = Warehouse::findOrFail($id);

        if ($user->role === 'partner') {
            $partner = Partner::where('user_id', $user->id)->first();
            if ($warehouse->partner_id !== $partner?->id) {
                return ApiResponse::error('FORBIDDEN', 'You do not own this warehouse', [], 403);
            }
        } elseif (!in_array($user->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:active,inactive',
            'total_capacity' => 'sometimes|numeric|min:0',
        ]);

        if (isset($validated['total_capacity'])) {
            $used = $warehouse->total_capacity - $warehouse->available_capacity;
            if ($validated['total_capacity'] < $used) {
                return ApiResponse::error('BAD_REQUEST', 'New total capacity cannot be less than used capacity', ['used' => $used], 400);
            }
            $warehouse->available_capacity = $validated['total_capacity'] - $used;
        }

        $warehouse->update($validated);

        return ApiResponse::ok($warehouse);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $warehouse = Warehouse::findOrFail($id);

        if ($user->role === 'partner') {
            $partner = Partner::where('user_id', $user->id)->first();
            if ($warehouse->partner_id !== $partner?->id) {
                return ApiResponse::error('FORBIDDEN', 'You do not own this warehouse', [], 403);
            }
        } elseif (!in_array($user->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $warehouse->delete(); // This will also delete inventory items due to DB cascade (if configured)

        return ApiResponse::ok(['deleted' => true]);
    }
}
