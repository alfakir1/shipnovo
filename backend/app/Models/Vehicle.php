<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{

    protected $fillable = [
        'fleet_id', 'make', 'model', 'year', 'plate_number', 
        'type', 'capacity_weight', 'capacity_volume', 
        'status', 'current_location'
    ];

    public function fleet()
    {
        return $this->belongsTo(Fleet::class);
    }
}
