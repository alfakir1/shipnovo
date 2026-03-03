<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipmentPartnerAssignment extends Model
{
    protected $fillable = [
        'shipment_id',
        'partner_id',
        'leg_type',
        'status',
        'notes',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }
}
