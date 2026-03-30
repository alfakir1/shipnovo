<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrder extends Model
{
    protected $fillable = ['shipment_id', 'partner_id', 'driver_id', 'vehicle_id', 'status'];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function driver()
    {
        return $this->belongsTo(DriverProfile::class, 'driver_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }
}
