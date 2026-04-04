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
            return ApiResponse::error('VALIDATION_ERROR', 'Validation failed', $validator->errors()->toArray());
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
            return ApiResponse::error('VALIDATION_ERROR', 'Validation failed', $validator->errors()->toArray());
        }

        $vehicle = $fleet->vehicles()->create([
            'make' => $request->make,
            'model' => $request->model,
            'plate_number' => $request->plate_number,
            'type' => $request->type,
            'capacity_weight' => $request->capacity_weight,
            'capacity_volume' => $request->capacity_volume,
            'status' => 'available',
        ]);

        return ApiResponse::ok($vehicle);
    }

    /**
     * Add a driver to a fleet.
     */
    public function addDriver(Request $request, $id)
    {
        $fleet = Fleet::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'license_number' => 'required|string|unique:driver_profiles',
            'license_type' => 'required|string',
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('VALIDATION_ERROR', 'Validation failed', $validator->errors()->toArray());
        }

        $driver = $fleet->drivers()->create($request->all());

        return ApiResponse::ok($driver);
    }

    /**
     * Assign a driver and vehicle to a shipment (via WorkOrder).
     */
    public function assignToShipment(Request $request, $shipmentId)
    {
        $partner = $request->user()->partner;
        if (!$partner) {
            return ApiResponse::error('FORBIDDEN', 'Partner profile not found', [], 403);
        }

        $validator = Validator::make($request->all(), [
            'driver_id' => 'required|exists:driver_profiles,id',
            'vehicle_id' => 'required|exists:vehicles,id',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('VALIDATION_ERROR', 'Validation failed', $validator->errors()->toArray());
        }

        $workOrder = \App\Models\WorkOrder::where('shipment_id', $shipmentId)
            ->where('partner_id', $partner->id)
            ->firstOrFail();

        $workOrder->update([
            'driver_id' => $request->driver_id,
            'vehicle_id' => $request->vehicle_id,
        ]);

        return ApiResponse::ok($workOrder->load(['driver', 'vehicle']));
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

        // Get all fleet IDs belonging to this partner
        $fleetIds = Fleet::where('partner_id', $partner->id)->pluck('id');

        // List all drivers registered under this partner's fleets
        $drivers = DriverProfile::whereIn('fleet_id', $fleetIds)
            ->with('user')
            ->get();

        return ApiResponse::ok($drivers);
    }
}
