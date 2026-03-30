<?php

namespace App\Http\Controllers\Api;

use App\Models\Shipment;
use App\Models\ReturnRequest;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\ReturnRequestedNotification;

class ReturnController extends ApiController
{
    public function index($shipmentId, Request $request)
    {
        $shipment = Shipment::findOrFail($shipmentId);
        
        // RBAC: Owner, Partner assigned, or Admin
        if ($request->user()->id !== $shipment->customer_id && !in_array($request->user()->role, ['admin', 'ops'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        return ApiResponse::ok($shipment->returns);
    }

    public function store($shipmentId, Request $request)
    {
        $request->validate(['reason' => 'required|string']);

        $shipment = Shipment::findOrFail($shipmentId);

        if ($request->user()->id !== $shipment->customer_id) {
            return ApiResponse::error('FORBIDDEN', 'Only the customer can request a return', [], 403);
        }

        $return = ReturnRequest::create([
            'shipment_id' => $shipment->id,
            'created_by' => $request->user()->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        // Notify Admin / Ops
        $admins = User::whereIn('role', ['admin', 'ops'])->get();
        Notification::send($admins, new ReturnRequestedNotification($shipment, $request->reason, $request->user()));

        // Notify Partner if assigned
        $partners = User::whereHas('partner', function ($q) use ($shipment) {
            $q->whereHas('assignments', function ($aq) use ($shipment) {
                $aq->where('shipment_id', $shipment->id);
            });
        })->get();

        Notification::send($partners, new ReturnRequestedNotification($shipment, $request->reason, $request->user()));

        return ApiResponse::created($return);
    }

    public function update($id, Request $request)
    {
        $request->validate(['status' => 'required|string']);

        if (!in_array($request->user()->role, ['admin', 'ops'])) {
            return ApiResponse::error('FORBIDDEN', 'Only Admin/Ops can update return status', [], 403);
        }

        $return = ReturnRequest::findOrFail($id);
        $return->update(['status' => $request->status]);

        return ApiResponse::ok($return);
    }
}
