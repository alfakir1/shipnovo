<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class PublicController extends Controller
{
    public function track(string $token): JsonResponse
    {
        $shipment = Shipment::where('tracking_token', $token)->first();

        if (!$shipment) {
            return ApiResponse::error('NOT_FOUND', 'Shipment not found or invalid token', [], 404);
        }

        // Return masked/basic data for guest users
        return ApiResponse::ok([
            'tracking_number' => $shipment->tracking_number,
            'status' => $shipment->status,
            'origin' => $shipment->origin,
            'destination' => $shipment->destination,
            'pickup_date' => $shipment->pickup_date,
            'events' => $shipment->events()->orderBy('created_at', 'desc')->get()->map(function($e) {
                return [
                    'title' => $e->status ?? $e.title,
                    'description' => $e->description ?? $e.remarks,
                    'created_at' => $e->created_at,
                    'is_current' => $e->is_current,
                ];
            }),
        ]);
    }
}
