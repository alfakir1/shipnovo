<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'shipment_id',
        'issued_by_user_id',
        'invoice_number',
        'amount',
        'currency',
        'due_date',
        'status',
    ];

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }
}
