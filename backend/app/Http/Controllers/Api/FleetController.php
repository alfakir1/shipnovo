<?php

namespace App\Http\Controllers\Api;

use App\Models\Fleet;
use App\Models\Vehicle;
use App\Models\DriverProfile;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FleetController extends ApiController
{
    /**
     * List fleets for the authenticated partner.
     */
    public function index(Request $request)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return ApiResponse::error('FORBIDDEN', 'Partner profile not found', [], 403);
        }

        $fleets = Fleet::where('partner_id', $partner->id)->withCount(['vehicles', 'drivers'])->get();
        return ApiResponse::ok($fleets);
    }

    /**
     * Create a new fleet.
     */
    public function store(Request $request)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return ApiResponse::error('FORBIDDEN', 'Partner profile not found', [], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('VALIDATION_ERROR', 'Validation failed', $validator->errors());
        }

        $fleet = Fleet::create([
            'partner_id' => $partner->id,
            'name' => $request->name,
            'description' => $request->description,
            'status' => 'active',
        ]);

        return ApiResponse::ok($fleet);
    }

    /**
     * List vehicles in a specific fleet.
     */
    public function vehicles($id)
    {
        $fleet = Fleet::findOrFail($id);
        
        // RBAC: Check owner or Ops
        // (Assuming partner context for now)

        return ApiResponse::ok($fleet->vehicles);
    }

    /**
     * Add a vehicle to a fleet.
     */
    public function addVehicle(Request $request, $id)
    {
        $fleet = Fleet::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'make' => 'required|string',
            'model' => 'required|string',
            'plate_number' => 'required|string|unique:vehicles',
            'type' => 'required|string',
            'capacity_weight' => 'required|numeric',
            'capacity_volume' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('VALIDATION_ERROR', 'Validation failed', $validator->errors());
        }

        $vehicle = $fleet->vehicles()->create($request->all());

        return ApiResponse::ok($vehicle);
    }

    /**
     * List drivers.
     */
    public function drivers(Request $request)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return ApiResponse::error('FORBIDDEN', 'Partner profile not found', [], 403);
        }

        // List all drivers registered under this partner's fleets
        $drivers = DriverProfile::whereHas('fleet', function($q) use ($partner) {
            $q->where('partner_id', $partner->id);
        })->with('user')->get();

        return ApiResponse::ok($drivers);
    }
}
