<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrackingEvent extends Model
{
    protected $fillable = [
        'shipment_id',
        'status',
        'status_code',
        'location',
        'description',
        'occurred_at',
        'is_current',
        'created_by',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($event) {
            if (empty($event->created_by) && auth()->check()) {
                $event->created_by = auth()->id();
            }
            if (empty($event->occurred_at)) {
                $event->occurred_at = now();
            }
        });
    }

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
