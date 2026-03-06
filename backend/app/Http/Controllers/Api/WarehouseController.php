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

        if ($user->role === 'partner') {
            $partner = Partner::where('user_id', $user->id)->first();
            $warehouses = Warehouse::where('partner_id', $partner->id)->get();
        } else {
            // For customers, show warehouses where they have inventory or contracts
            $warehouses = Warehouse::whereHas('inventoryItems', function ($q) use ($user) {
                $q->where('customer_id', $user->id);
            })->orWhereHas('storageContracts', function ($q) use ($user) {
                $q->where('customer_id', $user->id);
            })->get();
        }

        return ApiResponse::ok($warehouses);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'partner') {
            return ApiResponse::error('FORBIDDEN', 'Only partners can create warehouses', [], 403);
        }

        $partner = Partner::where('user_id', $user->id)->first();
        if (!$partner || !$partner->is_verified) {
            return ApiResponse::error('UNAUTHORIZED', 'Partner not verified', [], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'total_capacity' => 'required|numeric|min:0',
        ]);

        $warehouse = Warehouse::create([
            'partner_id' => $partner->id,
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
}
