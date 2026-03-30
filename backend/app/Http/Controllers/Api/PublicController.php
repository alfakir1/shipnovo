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
        // Allow lookup by tracking_token (secure link) OR tracking_number (short link)
        $shipment = Shipment::where('tracking_number', $token)
            ->orWhere('tracking_token', $token)
            ->first();

        if (!$shipment) {
            return ApiResponse::error('NOT_FOUND', 'Shipment not found or invalid token', [], 404);
        }

        // Return masked/basic data for guest users
        return ApiResponse::ok([
            'tracking_number' => $shipment->tracking_number,
            'status' => $shipment->status,
            'origin' => $shipment->origin,
            'destination' => $shipment->destination,
            'events' => $shipment->events()->orderBy('created_at', 'desc')->get()->map(function($e) {
                return [
                    'title' => $e->status ?? $e->title,
                    'description' => $e->description ?? $e->remarks,
                    'created_at' => $e->created_at,
                    'is_current' => $e->is_current,
                ];
            }),
        ]);
    }
}
