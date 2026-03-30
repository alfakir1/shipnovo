<?php

namespace App\Services\Shipment;

use App\Models\Shipment;
use Exception;

class ShipmentStateMachine
{
    const STATUS_RFQ = 'rfq';
    const STATUS_OFFERS_RECEIVED = 'offers_received';
    const STATUS_OFFER_SELECTED = 'offer_selected';
    const STATUS_PROCESSING = 'processing';
    const STATUS_TRANSIT = 'transit';
    const STATUS_AT_DESTINATION = 'at_destination';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CLOSED = 'closed';
    const STATUS_CANCELLED = 'cancelled';

    // Legacy support mapping
    protected static $legacyMap = [
        'pending' => self::STATUS_RFQ,
        'customs' => self::STATUS_PROCESSING,
    ];

    protected static $transitions = [
        self::STATUS_RFQ => [self::STATUS_OFFERS_RECEIVED, self::STATUS_CANCELLED],
        self::STATUS_OFFERS_RECEIVED => [self::STATUS_OFFER_SELECTED, self::STATUS_CANCELLED],
        self::STATUS_OFFER_SELECTED => [self::STATUS_PROCESSING, self::STATUS_CANCELLED],
        self::STATUS_PROCESSING => [self::STATUS_TRANSIT, self::STATUS_CANCELLED],
        self::STATUS_TRANSIT => [self::STATUS_AT_DESTINATION, self::STATUS_CANCELLED],
        self::STATUS_AT_DESTINATION => [self::STATUS_DELIVERED, self::STATUS_CANCELLED],
        self::STATUS_DELIVERED => [self::STATUS_CLOSED],
        self::STATUS_CANCELLED => [],
        self::STATUS_CLOSED => [],
    ];

    /**
     * Map old statuses to new ones for safety
     */
    public static function normalizeStatus(string $status): string
    {
        return self::$legacyMap[$status] ?? $status;
    }

    /**
     * Check if a transition is allowed
     */
    public static function canTransition(Shipment $shipment, string $toStatus): bool
    {
        $fromStatus = self::normalizeStatus($shipment->status);
        $toStatus = self::normalizeStatus($toStatus);

        if ($fromStatus === $toStatus) return true;

        $allowed = self::$transitions[$fromStatus] ?? [];
        return in_array($toStatus, $allowed);
    }

    /**
     * Transition a shipment to a new status
     */
    public static function transition(Shipment $shipment, string $toStatus): Shipment
    {
        if (!self::canTransition($shipment, $toStatus)) {
            throw new Exception("Invalid transition from {$shipment->status} to {$toStatus}");
        }

        $shipment->update(['status' => self::normalizeStatus($toStatus)]);

        $adminsAndOps = \App\Models\User::whereIn('role', ['admin', 'ops'])->get();
        \Illuminate\Support\Facades\Notification::send($adminsAndOps, new \App\Notifications\SystemNotification(
            'Shipment Updated: ' . $shipment->tracking_number,
            "Shipment status changed to " . self::normalizeStatus($toStatus) . ".",
            'system_operation',
            ['shipment_id' => $shipment->id]
        ));

        return $shipment;
    }
}
