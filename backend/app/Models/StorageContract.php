<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StorageContract extends Model
{
    protected $fillable = ['warehouse_id', 'customer_id', 'start_date', 'end_date', 'status', 'pricing_model', 'rate'];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
