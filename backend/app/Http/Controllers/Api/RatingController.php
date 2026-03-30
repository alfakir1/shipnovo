<?php

namespace App\Http\Controllers\Api;

use App\Models\Shipment;
use App\Models\Rating;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\ShipmentRatedNotification;

class RatingController extends ApiController
{
    public function store($shipmentId, Request $request)
    {
        $request->validate([
            'score' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
            'suggestions' => 'nullable|string',
        ]);

        $shipment = Shipment::findOrFail($shipmentId);

        if ($request->user()->id !== $shipment->customer_id) {
            return ApiResponse::error('FORBIDDEN', 'Only the customer can rate the shipment', [], 403);
        }

        if ($shipment->status !== Shipment::STATUS_DELIVERED) {
            return ApiResponse::error('INVALID_STATE', 'Only delivered shipments can be rated', [], 400);
        }

        // Find the carrier partner to assign the rating to
        $carrierAssignment = $shipment->assignments()->where('leg_type', 'freight')->first();
        $partnerId = $carrierAssignment ? $carrierAssignment->partner_id : null;

        $rating = Rating::updateOrCreate(
            ['shipment_id' => $shipment->id],
            [
                'rater_id' => $request->user()->id,
                'partner_id' => $partnerId,
                'score' => $request->score,
                'comment' => $request->comment,
                'suggestions' => $request->suggestions,
            ]
        );

        // Notify Admin / Ops
        $admins = User::whereIn('role', ['admin', 'ops'])->get();
        Notification::send($admins, new ShipmentRatedNotification($shipment, $request->score, $request->comment, $request->suggestions, $request->user()));

        // Notify Partner if assigned
        if ($partnerId) {
            $partnerUser = User::whereHas('partner', fn($q) => $q->where('id', $partnerId))->first();
            if ($partnerUser) {
                Notification::send($partnerUser, new ShipmentRatedNotification($shipment, $request->score, $request->comment, $request->suggestions, $request->user()));
            }
        }

        return ApiResponse::created($rating);
    }

    public function show($shipmentId)
    {
        $rating = Rating::where('shipment_id', $shipmentId)->first();
        return ApiResponse::ok($rating);
    }
}
