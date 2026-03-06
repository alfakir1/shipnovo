<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuoteInvitation extends Model
{
    protected $fillable = ['shipment_id', 'partner_id', 'invited_at'];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }
}
