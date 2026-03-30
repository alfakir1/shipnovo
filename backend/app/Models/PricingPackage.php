<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingPackage extends Model
{
    protected $fillable = [
        'name',
        'origin',
        'destination',
        'min_weight',
        'max_weight',
        'price',
        'currency',
        'type',
        'partner_id',
        'is_active',
    ];

    protected $casts = [
        'min_weight' => 'float',
        'max_weight' => 'float',
        'price' => 'float',
        'is_active' => 'boolean',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }
}
