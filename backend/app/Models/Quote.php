<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $fillable = [
        'shipment_id',
        'partner_id',
        'amount',
        'currency',
        'eta_days',
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
