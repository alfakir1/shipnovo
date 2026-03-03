<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'customer_id',
        'shipment_id',
        'subject',
        'description',
        'status',
        'priority',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class);
    }
}
