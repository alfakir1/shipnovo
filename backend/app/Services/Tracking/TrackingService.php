<?php

namespace App\Services\Tracking;

use App\Models\Shipment;
use App\Models\TrackingEvent;
use Illuminate\Support\Facades\Auth;

class TrackingService
{
    /**
     * List events for a shipment
     */
    public function getEvents(Shipment $shipment)
    {
        return $shipment->events()->with('creator')->latest()->get();
    }

    /**
     * Add a new tracking event
     */
    public function addEvent(Shipment $shipment, array $data, $userId)
    {
        $event = TrackingEvent::create([
            'shipment_id' => $shipment->id,
            'status_code' => $data['status_code'],
            'location' => $data['location'] ?? null,
            'description' => $data['description'],
            'occurred_at' => $data['timestamp'] ?? now(),
            'created_by' => $userId,
        ]);

        $adminsAndOps = \App\Models\User::whereIn('role', ['admin', 'ops'])->get();
        \Illuminate\Support\Facades\Notification::send($adminsAndOps, new \App\Notifications\SystemNotification(
            'New Tracking Event',
            "Shipment {$shipment->tracking_number}: {$data['description']}",
            'system_operation',
            ['shipment_id' => $shipment->id]
        ));

        return $event;
    }
}
