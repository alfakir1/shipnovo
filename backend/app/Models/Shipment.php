<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shipment extends Model
{
    use HasFactory;

    const STATUS_RFQ = 'rfq';
    const STATUS_PROCESSING = 'processing';
    const STATUS_TRANSIT = 'transit';
    const STATUS_AT_DESTINATION = 'at_destination';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CLOSED = 'closed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'tracking_number',
        'tracking_token',
        'customer_id',
        'created_by',
        'status',
        'origin',
        'destination',
        'mode',
        'service_type',
        'customer_price',
        'total_weight',
        'weight_unit',
        'volume',
        'cargo_type',
        'description',
        'internal_value',
        'pallet_count',
        'pickup_date',
        'needs_storage',
        'warehouse_id',
    ];

    protected $appends = ['has_return_request'];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function events()
    {
        return $this->hasMany(TrackingEvent::class);
    }

    public function assignments()
    {
        return $this->hasMany(ShipmentPartnerAssignment::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function returns()
    {
        return $this->hasMany(ReturnRequest::class);
    }

    public function activeReturn()
    {
        return $this->hasOne(ReturnRequest::class)->where('status', 'pending');
    }

    public function getHasReturnRequestAttribute()
    {
        return $this->returns()->where('status', 'pending')->exists();
    }

    public function rating()
    {
        return $this->hasOne(Rating::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function invitations()
    {
        return $this->hasMany(QuoteInvitation::class);
    }

    public function workOrder()
    {
        return $this->hasOne(WorkOrder::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($shipment) {
            if (empty($shipment->tracking_number)) {
                $shipment->tracking_number = 'SNV-' . strtoupper(\Illuminate\Support\Str::random(8));
            }
            if (empty($shipment->tracking_token)) {
                $shipment->tracking_token = 'tk_' . \Illuminate\Support\Str::random(32);
            }
        });
    }
}
