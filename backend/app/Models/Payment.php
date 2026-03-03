<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'shipment_id',
        'amount',
        'currency',
        'status',
        'transaction_id',
        'payment_method',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
