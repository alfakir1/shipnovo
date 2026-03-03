<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fleet extends Model
{

    protected $fillable = ['partner_id', 'name', 'description', 'status'];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function drivers()
    {
        return $this->hasMany(DriverProfile::class);
    }
}
