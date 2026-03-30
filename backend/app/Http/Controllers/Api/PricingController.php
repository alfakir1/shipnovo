<?php

namespace App\Http\Controllers\Api;

use App\Models\PricingPackage;
use Illuminate\Http\Request;
use App\Support\ApiResponse;

class PricingController extends ApiController
{
    public function index(Request $request)
    {
        $packages = PricingPackage::with('partner')
            ->where('is_active', true)
            ->orderBy('min_weight')
            ->get();

        return ApiResponse::ok($packages);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Only ops, admin, partner can create custom packages
        if ($user->role === 'customer') {
            return ApiResponse::error('FORBIDDEN', 'Customers cannot create pricing packages', [], 403);
        }

        $request->validate([
            'name' => 'required|string',
            'origin' => 'required|string',
            'destination' => 'required|string',
            'min_weight' => 'required|numeric|min:0',
            'max_weight' => 'required|numeric|gt:min_weight',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'partner_id' => 'nullable|exists:partners,id',
        ]);

        $package = PricingPackage::create([
            'name' => $request->name,
            'origin' => $request->origin,
            'destination' => $request->destination,
            'min_weight' => $request->min_weight,
            'max_weight' => $request->max_weight,
            'price' => $request->price,
            'currency' => $request->currency ?? 'USD',
            'type' => 'custom',
            'partner_id' => $request->partner_id,
            'is_active' => true,
        ]);

        return ApiResponse::created($package);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        if (!in_array($user->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Only ops/admin can update packages', [], 403);
        }

        $package = PricingPackage::findOrFail($id);

        $package->update($request->only([
            'name', 'origin', 'destination', 'min_weight', 'max_weight',
            'price', 'currency', 'partner_id', 'is_active'
        ]));

        return ApiResponse::ok($package);
    }
}
