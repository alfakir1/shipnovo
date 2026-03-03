<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverProfile extends Model
{

    protected $fillable = ['user_id', 'fleet_id', 'license_number', 'license_type', 'phone', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fleet()
    {
        return $this->belongsTo(Fleet::class);
    }
}
