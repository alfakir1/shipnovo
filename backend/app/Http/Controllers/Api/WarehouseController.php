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
            'pricing_model' => 'required|string|in:monthly,per_m3',
            'rate' => 'required|numeric|min:0',
        ]);

        $contract = \App\Models\StorageContract::create([
            'warehouse_id' => $validated['warehouse_id'],
            'customer_id' => $request->user()->id,
            'start_date' => $validated['start_date'],
            'status' => 'active',
            'pricing_model' => $validated['pricing_model'],
            'rate' => $validated['rate'],
        ]);

        return ApiResponse::created($contract);
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
}
